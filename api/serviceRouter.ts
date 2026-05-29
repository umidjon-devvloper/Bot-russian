import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { notify } from "./lib/notifications";
import { recalcSpecialist } from "./lib/recalc-specialist";

export const serviceRouter = createRouter({
  list: publicQuery
    .input(z.object({ categoryId: z.number().optional(), search: z.string().optional(), limit: z.number().default(20), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const sql = getDb();
      const p: { categoryId?: number; search?: string; limit?: number; offset?: number } = input || {};
      const rows = await sql`
        SELECT s.*, c.name AS category_name, c.emoji AS category_emoji,
               u.first_name, u.last_name, u.username, u.photo_url,
               sp.status AS specialist_status, CAST(sp.rating AS float) AS specialist_rating,
               (SELECT file_path FROM service_images WHERE service_id = s.id ORDER BY sort_order LIMIT 1) AS cover_image
        FROM services s JOIN users u ON u.id = s.user_id
        JOIN categories c ON c.id = s.category_id
        LEFT JOIN specialist_profiles sp ON sp.user_id = s.user_id
        WHERE s.status = 'active' AND u.is_blocked = false
          ${p.categoryId ? sql`AND s.category_id = ${p.categoryId}` : sql``}
          ${p.search ? sql`AND (s.title ILIKE ${"%" + p.search + "%"})` : sql``}
        ORDER BY sp.rating DESC NULLS LAST, s.views DESC
        LIMIT ${p.limit || 20} OFFSET ${p.offset || 0}
      `;
      return rows.map((r: any) => ({
        id: Number(r.id), userId: Number(r.user_id), title: r.title, description: r.description,
        price: Number(r.price), currency: r.currency, categoryName: r.category_name, categoryEmoji: r.category_emoji,
        views: r.views, avgRating: Number(r.avg_rating || 0),
        coverImage: r.cover_image || null,
        specialistFirstName: r.first_name, specialistLastName: r.last_name, specialistPhoto: r.photo_url,
        specialistStatus: r.specialist_status, specialistRating: Number(r.specialist_rating || 0),
      }));
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        SELECT s.*, c.name AS category_name, c.emoji AS category_emoji,
               u.first_name, u.last_name, u.username, u.photo_url,
               sp.status AS spec_status, CAST(sp.rating AS float) AS spec_rating, sp.total_deals
        FROM services s JOIN users u ON u.id = s.user_id
        JOIN categories c ON c.id = s.category_id
        LEFT JOIN specialist_profiles sp ON sp.user_id = s.user_id
        WHERE s.id = ${input.id}
      `;
      if (!rows.length) return null;
      const r = rows[0] as any;
      await sql`UPDATE services SET views = views + 1 WHERE id = ${input.id}`;
      const images = await sql`SELECT file_path FROM service_images WHERE service_id = ${input.id} ORDER BY sort_order`;
      const reviews = await sql`
        SELECT r.*, uc.first_name AS cust_name, uc.photo_url AS cust_photo
        FROM reviews r JOIN users uc ON uc.id = r.customer_id
        WHERE r.service_id = ${input.id} AND r.status = 'active'
        ORDER BY r.created_at DESC LIMIT 10
      `;
      return {
        id: Number(r.id), userId: Number(r.user_id), title: r.title, description: r.description,
        price: Number(r.price), currency: r.currency, deadlineValue: r.deadline_value, deadlineUnit: r.deadline_unit,
        whatIncluded: r.what_included, tags: r.tags, safeDeal: r.safe_deal, views: r.views,
        avgRating: Number(r.avg_rating || 0), categoryName: r.category_name, categoryEmoji: r.category_emoji,
        images: images.map((i: any) => i.file_path),
        specialist: { firstName: r.first_name, lastName: r.last_name, username: r.username, photoUrl: r.photo_url, status: r.spec_status, rating: Number(r.spec_rating || 0), totalDeals: r.total_deals },
        reviews: reviews.map((rev: any) => ({ id: Number(rev.id), overall: rev.overall, qualityRating: rev.quality_rating, text: rev.text, createdAt: rev.created_at, customerName: rev.cust_name, customerPhoto: rev.cust_photo })),
      };
    }),

  create: publicMutation
    .input(z.object({
      telegramId: z.number(),
      categoryId: z.number(),
      title: z.string().min(3).max(100),
      description: z.string().optional(),
      price: z.number().positive(),
      currency: z.string().default("RUB"),
      deadlineValue: z.number().optional(),
      deadlineUnit: z.string().optional(),
      whatIncluded: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      imageUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const userId = Number(users[0].id);
      const [svc] = await sql`
        INSERT INTO services (user_id, category_id, title, description, price, currency, deadline_value, deadline_unit, what_included, tags, status)
        VALUES (${userId}, ${input.categoryId}, ${input.title}, ${input.description ?? null}, ${input.price}, ${input.currency}, ${input.deadlineValue ?? null}, ${input.deadlineUnit ?? null}, ${input.whatIncluded ? JSON.stringify(input.whatIncluded) : null}, ${input.tags ? JSON.stringify(input.tags) : null}, 'active')
        RETURNING id
      `;
      const serviceId = Number(svc.id);
      // Сохраняем изображения, если есть
      if (input.imageUrls && input.imageUrls.length) {
        for (let i = 0; i < input.imageUrls.length; i++) {
          await sql`
            INSERT INTO service_images (service_id, file_path, sort_order)
            VALUES (${serviceId}, ${input.imageUrls[i]}, ${i})
          `;
        }
      }
      // Новая услуга влияет на заполненность профиля
      await recalcSpecialist(userId);
      return { ok: true, id: serviceId };
    }),

  /**
   * Mutaxassisning o'z xizmatlari ro'yxati (boshqarish uchun).
   */
  myList: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) return [];
      const uid = Number(users[0].id);
      const rows = await sql`
        SELECT s.*, c.name AS category_name, c.emoji AS category_emoji,
          (SELECT file_path FROM service_images WHERE service_id = s.id ORDER BY sort_order LIMIT 1) AS cover_image
        FROM services s LEFT JOIN categories c ON c.id = s.category_id
        WHERE s.user_id = ${uid}
        ORDER BY s.created_at DESC
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        price: Number(r.price),
        currency: r.currency,
        status: r.status,
        rejectionReason: r.rejection_reason,
        views: r.views,
        contactClicks: r.contact_clicks,
        avgRating: Number(r.avg_rating || 0),
        categoryName: r.category_name,
        categoryEmoji: r.category_emoji,
        categoryId: r.category_id ? Number(r.category_id) : null,
        deadlineValue: r.deadline_value,
        deadlineUnit: r.deadline_unit,
        whatIncluded: r.what_included,
        tags: r.tags,
        coverImage: r.cover_image || null,
        createdAt: r.created_at,
      }));
    }),

  update: publicMutation
    .input(z.object({
      telegramId: z.number(),
      serviceId: z.number(),
      title: z.string().min(3).max(100).optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      price: z.number().positive().optional(),
      currency: z.string().optional(),
      deadlineValue: z.number().optional(),
      deadlineUnit: z.string().optional(),
      whatIncluded: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      const [row] = await sql`
        UPDATE services SET
          title = COALESCE(${input.title ?? null}, title),
          description = COALESCE(${input.description ?? null}, description),
          category_id = COALESCE(${input.categoryId ?? null}, category_id),
          price = COALESCE(${input.price ?? null}, price),
          currency = COALESCE(${input.currency ?? null}, currency),
          deadline_value = COALESCE(${input.deadlineValue ?? null}, deadline_value),
          deadline_unit = COALESCE(${input.deadlineUnit ?? null}, deadline_unit),
          what_included = COALESCE(${input.whatIncluded ? JSON.stringify(input.whatIncluded) : null}, what_included),
          tags = COALESCE(${input.tags ? JSON.stringify(input.tags) : null}, tags),
          updated_at = NOW()
        WHERE id = ${input.serviceId} AND user_id = ${uid}
        RETURNING id
      `;
      if (!row) throw new Error("Service not found or not yours");
      return { ok: true };
    }),

  remove: publicMutation
    .input(z.object({ telegramId: z.number(), serviceId: z.number() }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      await sql`UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ${input.serviceId} AND user_id = ${uid}`;
      await recalcSpecialist(uid);
      return { ok: true };
    }),

  /**
   * Admin moderatsiyasi: xizmat statusini o'zgartiradi (pending → active | rejected | archived).
   * Mutaxassisga shaxsiy bildirishnoma yuboriladi.
   */
  setStatus: publicMutation
    .input(z.object({
      telegramId: z.number(),
      serviceId: z.number(),
      status: z.enum(["pending", "active", "rejected", "archived"]),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const admins = await sql`SELECT id, role FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!admins.length || admins[0].role !== "admin") throw new Error("Forbidden");

      const [svc] = await sql`
        UPDATE services
        SET status = ${input.status},
            rejection_reason = ${input.rejectionReason ?? null},
            updated_at = NOW()
        WHERE id = ${input.serviceId}
        RETURNING user_id, title
      `;
      if (!svc) throw new Error("Service not found");

      const statusLabels: Record<string, string> = {
        active: "✅ Одобрена",
        rejected: "❌ Отклонена",
        archived: "📦 В архиве",
        pending: "⏳ На модерации",
      };
      await notify({
        userId: Number(svc.user_id),
        type: "service_status_changed",
        title: `Статус услуги: ${statusLabels[input.status]}`,
        body: `«${svc.title}» — ${input.rejectionReason || statusLabels[input.status]}`,
        data: { serviceId: input.serviceId, newStatus: input.status },
      });

      if (input.status === "active" || input.status === "archived" || input.status === "rejected") {
        await recalcSpecialist(Number(svc.user_id));
      }

      return { ok: true };
    }),
});

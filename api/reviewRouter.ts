import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { notify } from "./lib/notifications";
import { recalcSpecialist } from "./lib/recalc-specialist";

export const reviewRouter = createRouter({
  list: publicQuery
    .input(z.object({
      serviceId: z.number().optional(),
      specialistId: z.number().optional(),
      limit: z.number().default(10),
    }).optional())
    .query(async ({ input }) => {
      const sql = getDb();
      const p: { serviceId?: number; specialistId?: number; limit?: number } = input || {};
      const rows = await sql`
        SELECT r.*, u.first_name AS customer_first_name, u.last_name AS customer_last_name, u.photo_url AS customer_photo
        FROM reviews r
        JOIN users u ON u.id = r.customer_id
        WHERE r.status = 'active'
          ${p.serviceId ? sql`AND r.service_id = ${p.serviceId}` : sql``}
          ${p.specialistId ? sql`AND r.specialist_id = ${p.specialistId}` : sql``}
        ORDER BY r.created_at DESC
        LIMIT ${p.limit || 10}
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        overall: r.overall,
        qualityRating: r.quality_rating,
        timingRating: r.timing_rating,
        communicationRating: r.communication_rating,
        text: r.text,
        specialistReply: r.specialist_reply,
        createdAt: r.created_at,
        customerFirstName: r.customer_first_name,
        customerLastName: r.customer_last_name,
        customerPhoto: r.customer_photo,
      }));
    }),

  create: publicMutation
    .input(z.object({
      telegramId: z.number(),
      specialistId: z.number(),
      serviceId: z.number().optional(),
      contactId: z.number().optional(),
      overall: z.enum(["thumbs_up", "neutral", "thumbs_down"]),
      qualityRating: z.number().min(1).max(5).optional(),
      timingRating: z.number().min(1).max(5).optional(),
      communicationRating: z.number().min(1).max(5).optional(),
      text: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id, first_name FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const customerId = Number(users[0].id);
      const customerName = users[0].first_name || "Заказчик";

      const [row] = await sql`
        INSERT INTO reviews (customer_id, specialist_id, service_id, contact_id, overall, quality_rating, timing_rating, communication_rating, text, status)
        VALUES (${customerId}, ${input.specialistId}, ${input.serviceId ?? null}, ${input.contactId ?? null},
                ${input.overall}, ${input.qualityRating ?? null}, ${input.timingRating ?? null}, ${input.communicationRating ?? null}, ${input.text ?? null},
                'active')
        RETURNING id
      `;

      // Reyting va o'rtacha baholarni qayta hisoblash
      await sql`
        UPDATE specialist_profiles SET
          total_reviews = total_reviews + 1,
          rating = (
            SELECT ROUND(
              CAST(
                (COUNT(*) FILTER (WHERE overall='thumbs_up') * 5.0 +
                 COUNT(*) FILTER (WHERE overall='neutral') * 3.0) /
                NULLIF(COUNT(*), 0)
              AS numeric), 2)
            FROM reviews WHERE specialist_id = ${input.specialistId} AND status = 'active'
          ),
          avg_quality = COALESCE((SELECT ROUND(AVG(quality_rating)::numeric, 1) FROM reviews WHERE specialist_id = ${input.specialistId} AND status = 'active' AND quality_rating IS NOT NULL), 0),
          avg_timing = COALESCE((SELECT ROUND(AVG(timing_rating)::numeric, 1) FROM reviews WHERE specialist_id = ${input.specialistId} AND status = 'active' AND timing_rating IS NOT NULL), 0),
          avg_communication = COALESCE((SELECT ROUND(AVG(communication_rating)::numeric, 1) FROM reviews WHERE specialist_id = ${input.specialistId} AND status = 'active' AND communication_rating IS NOT NULL), 0),
          updated_at = NOW()
        WHERE user_id = ${input.specialistId}
      `;

      // Status va profil to'ldirilganligini qayta hisoblash
      const recalc = await recalcSpecialist(input.specialistId);

      // Mutaxassisga yangi sharh haqida bildirishnoma
      const emoji = input.overall === "thumbs_up" ? "👍" : input.overall === "neutral" ? "😐" : "👎";
      await notify({
        userId: input.specialistId,
        type: "new_review",
        title: `Новый отзыв ${emoji}`,
        body: `${customerName} оставил вам отзыв${input.text ? `: "${input.text.slice(0, 120)}"` : "."}`,
        data: { reviewId: Number(row.id), overall: input.overall, serviceId: input.serviceId },
      });

      // Статус повысился — отправляем поздравление
      if (recalc?.changed) {
        const statusLabels: Record<string, string> = {
          master: "Мастер ⭐",
          expert: "Эксперт 🏆",
          top: "Топ 💎",
        };
        const label = statusLabels[recalc.status];
        if (label) {
          await notify({
            userId: input.specialistId,
            type: "service_status_changed",
            title: `Поздравляем! Новый статус: ${label}`,
            body: `Ваш статус на бирже обновлён.`,
            data: { newStatus: recalc.status },
          });
        }
      }

      return { ok: true, id: Number(row.id) };
    }),

  reply: publicMutation
    .input(z.object({
      telegramId: z.number(),
      reviewId: z.number(),
      reply: z.string().min(1).max(1000),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const specialistId = Number(users[0].id);

      const [updated] = await sql`
        UPDATE reviews
        SET specialist_reply = ${input.reply}, updated_at = NOW()
        WHERE id = ${input.reviewId} AND specialist_id = ${specialistId}
        RETURNING customer_id
      `;
      if (!updated) throw new Error("Review not found or not yours");

      // Уведомление заказчику об ответе специалиста
      await notify({
        userId: Number(updated.customer_id),
        type: "new_review",
        title: "Специалист ответил на ваш отзыв",
        body: input.reply.slice(0, 200),
        data: { reviewId: input.reviewId },
      });

      return { ok: true };
    }),
});

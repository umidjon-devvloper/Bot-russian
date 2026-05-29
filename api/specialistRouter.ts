import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { notifyBot } from "./lib/bot-notify";
import { recalcSpecialist } from "./lib/recalc-specialist";

export const specialistRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      minRating: z.number().optional(),
      categoryId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const sql = getDb();
      const p: { search?: string; status?: string; minRating?: number; categoryId?: number; limit?: number; offset?: number } = input || {};
      const rows = await sql`
        SELECT u.id, u.first_name, u.last_name, u.username, u.photo_url,
               u.country, u.city, u.bio,
               sp.specialization, sp.status,
               CAST(sp.rating AS float) AS rating,
               sp.total_contacts, sp.total_reviews, sp.total_deals
        FROM specialist_profiles sp
        JOIN users u ON u.id = sp.user_id
        WHERE sp.is_visible = true AND u.is_blocked = false
          ${p.status ? sql`AND sp.status = ${p.status}` : sql``}
          ${p.minRating ? sql`AND CAST(sp.rating AS float) >= ${p.minRating}` : sql``}
          ${p.categoryId ? sql`AND (sp.primary_category_id = ${p.categoryId} OR EXISTS (SELECT 1 FROM services s WHERE s.user_id = u.id AND s.category_id = ${p.categoryId} AND s.status = 'active'))` : sql``}
          ${p.search ? sql`AND (u.first_name ILIKE ${"%" + p.search + "%"} OR u.last_name ILIKE ${"%" + p.search + "%"} OR sp.specialization ILIKE ${"%" + p.search + "%"})` : sql``}
        ORDER BY sp.rating DESC, sp.total_deals DESC
        LIMIT ${p.limit || 20} OFFSET ${p.offset || 0}
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        firstName: r.first_name, lastName: r.last_name,
        username: r.username, photoUrl: r.photo_url,
        country: r.country, city: r.city, bio: r.bio,
        specialization: r.specialization, status: r.status,
        rating: Number(r.rating || 0),
        totalContacts: r.total_contacts, totalReviews: r.total_reviews, totalDeals: r.total_deals,
      }));
    }),

  detail: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        SELECT u.*, sp.*, CAST(sp.rating AS float) AS rating_f
        FROM users u JOIN specialist_profiles sp ON sp.user_id = u.id
        WHERE u.id = ${input.id}
      `;
      if (!rows.length) return null;
      const user = rows[0] as any;
      const services = await sql`
        SELECT s.*, c.name AS category_name, c.emoji AS category_emoji,
          (SELECT file_path FROM service_images WHERE service_id = s.id ORDER BY sort_order LIMIT 1) AS cover_image
        FROM services s LEFT JOIN categories c ON c.id = s.category_id
        WHERE s.user_id = ${input.id} AND s.status = 'active'
        ORDER BY s.created_at DESC
      `;
      const reviews = await sql`
        SELECT r.*, uc.first_name AS customer_first_name, uc.photo_url AS customer_photo
        FROM reviews r JOIN users uc ON uc.id = r.customer_id
        WHERE r.specialist_id = ${input.id} AND r.status = 'active'
        ORDER BY r.created_at DESC LIMIT 20
      `;
      const portfolios = await sql`
        SELECT p.*, COALESCE(json_agg(pi.file_path ORDER BY pi.sort_order) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
        FROM portfolios p LEFT JOIN portfolio_images pi ON pi.portfolio_id = p.id
        WHERE p.user_id = ${input.id} AND p.status = 'active'
        GROUP BY p.id ORDER BY p.created_at DESC
      `;
      const links = await sql`SELECT * FROM external_links WHERE user_id = ${input.id} AND is_visible = true AND status = 'active'`;
      return {
        user: { id: Number(user.id), firstName: user.first_name, lastName: user.last_name, username: user.username, photoUrl: user.photo_url, country: user.country, city: user.city, bio: user.bio },
        profile: { specialization: user.specialization, status: user.status, rating: Number(user.rating_f || 0), totalContacts: user.total_contacts, totalReviews: user.total_reviews, totalDeals: user.total_deals, avgQuality: Number(user.avg_quality || 0), avgTiming: Number(user.avg_timing || 0), avgCommunication: Number(user.avg_communication || 0) },
        services: services.map((s: any) => ({ id: Number(s.id), title: s.title, description: s.description, price: Number(s.price), currency: s.currency, categoryName: s.category_name, categoryEmoji: s.category_emoji, views: s.views, avgRating: Number(s.avg_rating || 0), coverImage: s.cover_image || null })),
        reviews: reviews.map((r: any) => ({ id: Number(r.id), overall: r.overall, qualityRating: r.quality_rating, text: r.text, createdAt: r.created_at, customerFirstName: r.customer_first_name, customerPhoto: r.customer_photo })),
        portfolios: portfolios.map((p: any) => ({ id: Number(p.id), description: p.description, tags: p.tags, images: p.images || [] })),
        links: links.map((l: any) => ({ linkType: l.link_type, url: l.url, title: l.title })),
      };
    }),

  updateProfile: publicMutation
    .input(z.object({
      telegramId: z.number(),
      specialization: z.string().optional(),
      categoryId: z.number().optional(),
      bio: z.string().max(500).optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        UPDATE users SET
          bio = COALESCE(${input.bio ?? null}, bio),
          city = COALESCE(${input.city ?? null}, city),
          country = COALESCE(${input.country ?? null}, country),
          updated_at = NOW()
        WHERE telegram_id = ${input.telegramId}
        RETURNING id
      `;
      if (!rows.length) throw new Error("User not found");
      const userId = Number(rows[0].id);
      if (input.specialization !== undefined || input.categoryId !== undefined) {
        await sql`
          UPDATE specialist_profiles SET
            specialization = COALESCE(${input.specialization ?? null}, specialization),
            primary_category_id = COALESCE(${input.categoryId ?? null}, primary_category_id),
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      }
      const recalc = await recalcSpecialist(userId);
      return { ok: true, profileCompletion: recalc?.profileCompletion ?? null, status: recalc?.status ?? null };
    }),

  publishToTopic: publicMutation
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await notifyBot("specialist/published", { user_id: input.userId });
      return { ok: true };
    }),

  stats: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT COUNT(*)::int AS total FROM specialist_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.is_visible = true AND u.is_blocked = false
    `;
    const total = rows[0].total;
    return { total, online: Math.floor(total * 0.3) };
  }),
});

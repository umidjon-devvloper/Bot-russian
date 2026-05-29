import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { recalcSpecialist } from "./lib/recalc-specialist";

export const portfolioRouter = createRouter({
  myList: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) return [];
      const uid = Number(users[0].id);
      const rows = await sql`
        SELECT p.*, s.title AS service_title,
          COALESCE(json_agg(pi.file_path ORDER BY pi.sort_order) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
        FROM portfolios p
        LEFT JOIN services s ON s.id = p.service_id
        LEFT JOIN portfolio_images pi ON pi.portfolio_id = p.id
        WHERE p.user_id = ${uid}
        GROUP BY p.id, s.title
        ORDER BY p.created_at DESC
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        description: r.description,
        tags: r.tags,
        status: r.status,
        serviceId: r.service_id ? Number(r.service_id) : null,
        serviceTitle: r.service_title,
        images: r.images || [],
        createdAt: r.created_at,
      }));
    }),

  create: publicMutation
    .input(z.object({
      telegramId: z.number(),
      description: z.string().min(3).max(1000),
      tags: z.array(z.string()).optional(),
      serviceId: z.number().optional(),
      imageUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      const [row] = await sql`
        INSERT INTO portfolios (user_id, service_id, description, tags, status)
        VALUES (${uid}, ${input.serviceId ?? null}, ${input.description},
                ${input.tags ? JSON.stringify(input.tags) : null}, 'active')
        RETURNING id
      `;
      if (input.imageUrls && input.imageUrls.length) {
        for (let i = 0; i < input.imageUrls.length; i++) {
          await sql`
            INSERT INTO portfolio_images (portfolio_id, file_path, sort_order)
            VALUES (${row.id}, ${input.imageUrls[i]}, ${i})
          `;
        }
      }
      await recalcSpecialist(uid);
      return { ok: true, id: Number(row.id) };
    }),

  remove: publicMutation
    .input(z.object({ telegramId: z.number(), portfolioId: z.number() }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      await sql`DELETE FROM portfolio_images WHERE portfolio_id IN (SELECT id FROM portfolios WHERE id = ${input.portfolioId} AND user_id = ${uid})`;
      await sql`DELETE FROM portfolios WHERE id = ${input.portfolioId} AND user_id = ${uid}`;
      await recalcSpecialist(uid);
      return { ok: true };
    }),

  // ─── External links ───────────────────────────────────────────────
  myLinks: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) return [];
      const uid = Number(users[0].id);
      const rows = await sql`SELECT * FROM external_links WHERE user_id = ${uid} ORDER BY created_at DESC`;
      return rows.map((r: any) => ({
        id: Number(r.id),
        linkType: r.link_type,
        url: r.url,
        title: r.title,
        status: r.status,
        isVisible: r.is_visible,
      }));
    }),

  addLink: publicMutation
    .input(z.object({
      telegramId: z.number(),
      linkType: z.string(),
      url: z.string().url(),
      title: z.string().max(100).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      await sql`
        INSERT INTO external_links (user_id, link_type, url, title, status, is_visible)
        VALUES (${uid}, ${input.linkType}, ${input.url}, ${input.title ?? null}, 'active', true)
      `;
      return { ok: true };
    }),

  removeLink: publicMutation
    .input(z.object({ telegramId: z.number(), linkId: z.number() }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const uid = Number(users[0].id);
      await sql`DELETE FROM external_links WHERE id = ${input.linkId} AND user_id = ${uid}`;
      return { ok: true };
    }),
});

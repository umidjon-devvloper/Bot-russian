import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { notify } from "./lib/notifications";

export const tenderRouter = createRouter({
  list: publicQuery
    .input(z.object({
      status: z.string().optional(),
      categoryId: z.number().optional(),
      priority: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const sql = getDb();
      const p: { status?: string; categoryId?: number; priority?: string; limit?: number; offset?: number } = input || {};
      const rows = await sql`
        SELECT t.*, c.name AS category_name, c.emoji AS category_emoji,
               u.first_name, u.last_name
        FROM tenders t
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN users u ON u.id = t.customer_id
        WHERE t.status = ${p.status || 'active'}
          ${p.categoryId ? sql`AND t.category_id = ${p.categoryId}` : sql``}
          ${p.priority ? sql`AND t.priority = ${p.priority}` : sql``}
        ORDER BY
          CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
          t.created_at DESC
        LIMIT ${p.limit || 10} OFFSET ${p.offset || 0}
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        budget: r.budget ? Number(r.budget) : null,
        deadline: r.deadline,
        status: r.status,
        priority: r.priority,
        views: r.views,
        responses: r.responses,
        categoryName: r.category_name,
        categoryEmoji: r.category_emoji,
        createdAt: r.created_at,
      }));
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        SELECT t.*, c.name AS category_name, c.emoji AS category_emoji,
               u.first_name, u.last_name, u.username
        FROM tenders t
        LEFT JOIN categories c ON c.id = t.category_id
        LEFT JOIN users u ON u.id = t.customer_id
        WHERE t.id = ${input.id}
      `;
      if (!rows.length) return null;
      const r = rows[0] as any;
      await sql`UPDATE tenders SET views = views + 1 WHERE id = ${input.id}`;
      return {
        id: Number(r.id),
        title: r.title,
        description: r.description,
        budget: r.budget ? Number(r.budget) : null,
        deadline: r.deadline,
        status: r.status,
        priority: r.priority,
        views: r.views,
        responses: r.responses,
        categoryName: r.category_name,
        categoryEmoji: r.category_emoji,
        customerFirstName: r.first_name,
        customerLastName: r.last_name,
        customerUsername: r.username,
        createdAt: r.created_at,
      };
    }),

  create: publicMutation
    .input(z.object({
      telegramId: z.number(),
      title: z.string().min(5).max(200),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      budget: z.number().optional(),
      deadline: z.string().optional(),
      priority: z.enum(["normal", "high", "urgent"]).default("normal"),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const userId = Number(users[0].id);
      const [row] = await sql`
        INSERT INTO tenders (customer_id, title, description, category_id, budget, deadline, priority)
        VALUES (${userId}, ${input.title}, ${input.description ?? null}, ${input.categoryId ?? null}, ${input.budget ?? null}, ${input.deadline ?? null}, ${input.priority})
        RETURNING id
      `;
      return { ok: true, id: Number(row.id) };
    }),

  /**
   * Mutaxassis tenderga murojaat qiladi. Buyurtmachiga DM yuboriladi.
   */
  respond: publicMutation
    .input(z.object({
      telegramId: z.number(),
      tenderId: z.number(),
      message: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id, first_name FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const specialistId = Number(users[0].id);
      const specialistName = users[0].first_name || "Специалист";

      const tenders = await sql`SELECT id, customer_id, title FROM tenders WHERE id = ${input.tenderId}`;
      if (!tenders.length) throw new Error("Tender not found");
      const tender = tenders[0] as any;
      if (Number(tender.customer_id) === specialistId) throw new Error("Cannot apply to own tender");

      await sql`UPDATE tenders SET responses = responses + 1, updated_at = NOW() WHERE id = ${input.tenderId}`;

      await notify({
        userId: Number(tender.customer_id),
        type: "new_tender_application",
        title: "Новый отклик на ваш тендер",
        body: `${specialistName} откликнулся на тендер «${tender.title}»${input.message ? `: "${input.message.slice(0, 120)}"` : "."}`,
        data: { tenderId: input.tenderId, specialistId, message: input.message },
      });

      return { ok: true };
    }),
});

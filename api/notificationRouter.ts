import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({
      telegramId: z.number(),
      unreadOnly: z.boolean().optional(),
      limit: z.number().default(30),
    }))
    .query(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) return { items: [], unreadCount: 0 };
      const userId = Number(users[0].id);

      const rows = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${userId}
          ${input.unreadOnly ? sql`AND is_read = false` : sql``}
        ORDER BY created_at DESC
        LIMIT ${input.limit}
      `;
      const unread = await sql`SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = ${userId} AND is_read = false`;

      return {
        unreadCount: Number(unread[0]?.c || 0),
        items: rows.map((r: any) => ({
          id: Number(r.id),
          type: r.type,
          title: r.title,
          body: r.body,
          data: r.data,
          isRead: r.is_read,
          createdAt: r.created_at,
        })),
      };
    }),

  markRead: publicMutation
    .input(z.object({
      telegramId: z.number(),
      notificationId: z.number().optional(),
      all: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const userId = Number(users[0].id);

      if (input.all) {
        await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId} AND is_read = false`;
      } else if (input.notificationId) {
        await sql`UPDATE notifications SET is_read = true WHERE id = ${input.notificationId} AND user_id = ${userId}`;
      }
      return { ok: true };
    }),
});

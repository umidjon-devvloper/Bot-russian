import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { notifyBot } from "./lib/bot-notify";

export const vacancyRouter = createRouter({
  /**
   * Список доступных каналов для публикации
   */
  channels: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, username, description, members_count, category
      FROM publication_channels
      WHERE is_active = true
      ORDER BY name
    `;
    return rows.map((r: any) => ({
      id: Number(r.id),
      name: r.name,
      username: r.username,
      description: r.description,
      membersCount: r.members_count,
      category: r.category,
    }));
  }),

  /**
   * Создать заявку на публикацию вакансии
   */
  create: publicMutation
    .input(
      z.object({
        telegramId: z.number(),
        title: z.string().min(5).max(200),
        description: z.string().min(20).max(2000),
        budget: z.string().optional(),
        contactInfo: z.string().optional(),
        channelIds: z.array(z.number()).min(1),
      })
    )
    .mutation(async ({ input }) => {
      const sql = getDb();

      // Получаем user_id по telegramId
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const userId = Number(users[0].id);

      // Получаем tg_channel_id по выбранным id
      const channels = await sql`
        SELECT tg_channel_id FROM publication_channels
        WHERE id = ANY(${input.channelIds}::int[]) AND is_active = true
      `;
      const channelTgIds = channels.map((c: any) => Number(c.tg_channel_id));

      const [pub] = await sql`
        INSERT INTO channel_publications
          (user_id, title, description, budget, contact_info, channels, status)
        VALUES (
          ${userId},
          ${input.title},
          ${input.description},
          ${input.budget ?? null},
          ${input.contactInfo ?? null},
          ${JSON.stringify(channelTgIds)},
          'pending'
        )
        RETURNING id
      `;

      const pubId = Number(pub.id);

      // Публикуем через бота
      await notifyBot("vacancy/publish", { publication_id: pubId });

      return { ok: true, publicationId: pubId };
    }),

  /**
   * История публикаций пользователя
   */
  myPublications: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        SELECT cp.*
        FROM channel_publications cp
        JOIN users u ON u.id = cp.user_id
        WHERE u.telegram_id = ${input.telegramId}
        ORDER BY cp.created_at DESC
        LIMIT 20
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description,
        budget: r.budget,
        status: r.status,
        publishedAt: r.published_at,
        createdAt: r.created_at,
      }));
    }),
});

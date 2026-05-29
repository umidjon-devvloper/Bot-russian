import { z } from "zod";
import { createRouter, publicMutation, publicQuery, protectedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import {
  validateTelegramInitData,
  validateTelegramLoginWidget,
} from "./lib/telegram-auth";

export const authRouter = createRouter({
  /**
   * Авторизация через Telegram Mini App initData
   * Вызывается при первом открытии приложения
   */
  telegramAuth: publicMutation
    .input(
      z.object({
        initData: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const sql = getDb();

      const tgUser = validateTelegramInitData(input.initData, process.env.BOT_TOKEN || "");
      if (!tgUser) {
        throw new Error("Invalid Telegram auth data");
      }

      // Upsert пользователя
      const [user] = await sql`
        INSERT INTO users (telegram_id, first_name, last_name, username, photo_url, last_seen)
        VALUES (
          ${tgUser.id},
          ${tgUser.first_name},
          ${tgUser.last_name ?? null},
          ${tgUser.username ?? null},
          ${tgUser.photo_url ?? null},
          NOW()
        )
        ON CONFLICT (telegram_id) DO UPDATE
        SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          username = EXCLUDED.username,
          photo_url = EXCLUDED.photo_url,
          last_seen = NOW(),
          updated_at = NOW()
        RETURNING *
      `;

      return {
        id: Number(user.id),
        telegramId: Number(user.telegram_id),
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        role: user.role,
        selectedRole: user.selected_role,
        onboardingComplete: user.onboarding_complete,
        isBlocked: user.is_blocked,
      };
    }),

  /**
   * Выбор роли после первого входа
   */
  setRole: publicMutation
    .input(
      z.object({
        telegramId: z.number(),
        role: z.enum(["specialist", "customer", "both"]),
      })
    )
    .mutation(async ({ input }) => {
      const sql = getDb();

      const [user] = await sql`
        UPDATE users
        SET selected_role = ${input.role}, updated_at = NOW()
        WHERE telegram_id = ${input.telegramId}
        RETURNING *
      `;

      if (!user) throw new Error("User not found");

      // Создаём профиль если нужно
      if (input.role === "specialist" || input.role === "both") {
        await sql`
          INSERT INTO specialist_profiles (user_id)
          VALUES (${user.id})
          ON CONFLICT (user_id) DO NOTHING
        `;
      }
      if (input.role === "customer" || input.role === "both") {
        await sql`
          INSERT INTO customer_profiles (user_id)
          VALUES (${user.id})
          ON CONFLICT (user_id) DO NOTHING
        `;
      }

      return { ok: true };
    }),

  /**
   * Завершение онбординга
   */
  completeOnboarding: publicMutation
    .input(z.object({ telegramId: z.number() }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      await sql`
        UPDATE users
        SET onboarding_complete = true, updated_at = NOW()
        WHERE telegram_id = ${input.telegramId}
      `;
      return { ok: true };
    }),

  /**
   * Получить текущего пользователя по telegramId
   */
  me: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      // Har kirishda last_seen yangilanadi (faollik statistikasi uchun)
      await sql`UPDATE users SET last_seen = NOW() WHERE telegram_id = ${input.telegramId}`;
      const [user] = await sql`
        SELECT * FROM users WHERE telegram_id = ${input.telegramId}
      `;
      if (!user) return null;

      return {
        id: Number(user.id),
        telegramId: Number(user.telegram_id),
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        role: user.role,
        selectedRole: user.selected_role,
        onboardingComplete: user.onboarding_complete,
        isBlocked: user.is_blocked,
        country: user.country,
        city: user.city,
        bio: user.bio,
        profileCompletion: user.profile_completion,
      };
    }),
});

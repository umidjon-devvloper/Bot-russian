import { z } from "zod";
import { createRouter, publicQuery, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";

export const userRouter = createRouter({
  me: publicQuery
    .input(z.object({ telegramId: z.number() }).optional())
    .query(async ({ input }) => {
      if (!input?.telegramId) return null;
      const sql = getDb();
      const rows = await sql`
        SELECT u.*,
          row_to_json(sp.*) AS specialist_profile,
          row_to_json(cp.*) AS customer_profile
        FROM users u
        LEFT JOIN specialist_profiles sp ON sp.user_id = u.id
        LEFT JOIN customer_profiles cp ON cp.user_id = u.id
        WHERE u.telegram_id = ${input.telegramId}
      `;
      if (!rows.length) return null;
      const r = rows[0] as any;
      return {
        id: Number(r.id),
        telegramId: Number(r.telegram_id),
        firstName: r.first_name,
        lastName: r.last_name,
        username: r.username,
        photoUrl: r.photo_url,
        role: r.role,
        selectedRole: r.selected_role,
        onboardingComplete: r.onboarding_complete,
        country: r.country,
        city: r.city,
        bio: r.bio,
        profileCompletion: r.profile_completion,
        isBlocked: r.is_blocked,
        specialistProfile: r.specialist_profile,
        customerProfile: r.customer_profile,
      };
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`
        SELECT u.*, row_to_json(sp.*) AS specialist_profile
        FROM users u
        LEFT JOIN specialist_profiles sp ON sp.user_id = u.id
        WHERE u.id = ${input.id}
      `;
      if (!rows.length) return null;
      const r = rows[0] as any;
      return {
        id: Number(r.id),
        telegramId: Number(r.telegram_id),
        firstName: r.first_name,
        lastName: r.last_name,
        username: r.username,
        photoUrl: r.photo_url,
        role: r.role,
        selectedRole: r.selected_role,
        country: r.country,
        city: r.city,
        bio: r.bio,
        profileCompletion: r.profile_completion,
        specialistProfile: r.specialist_profile,
      };
    }),

  updateProfile: publicMutation
    .input(z.object({
      telegramId: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      bio: z.string().max(500).optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      await sql`
        UPDATE users SET
          first_name = COALESCE(${input.firstName ?? null}, first_name),
          last_name = COALESCE(${input.lastName ?? null}, last_name),
          bio = COALESCE(${input.bio ?? null}, bio),
          city = COALESCE(${input.city ?? null}, city),
          country = COALESCE(${input.country ?? null}, country),
          updated_at = NOW()
        WHERE telegram_id = ${input.telegramId}
      `;
      return { ok: true };
    }),

  isAdmin: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`SELECT role FROM users WHERE telegram_id = ${input.telegramId}`;
      return { isAdmin: rows.length > 0 && rows[0].role === "admin" };
    }),
});

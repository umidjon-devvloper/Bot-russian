import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, slug, emoji, icon, sort_order FROM categories
      WHERE is_active = true ORDER BY sort_order
    `;
    return rows.map((r: any) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      emoji: r.emoji,
      icon: r.icon,
      sortOrder: r.sort_order,
    }));
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const rows = await sql`SELECT * FROM categories WHERE slug = ${input.slug} AND is_active = true`;
      if (!rows.length) return null;
      const r = rows[0] as any;
      return { id: Number(r.id), name: r.name, slug: r.slug, emoji: r.emoji };
    }),
});

/**
 * Idempotent runtime migrations.
 * Запускаются один раз при старте сервера. Все ALTER должны быть IF NOT EXISTS
 * чтобы безопасно выполняться многократно.
 */
import { getDb } from "../queries/connection";

let _migrationsRan = false;

export async function runMigrations(): Promise<void> {
  if (_migrationsRan) return;
  const sql = getDb();
  try {
    await sql`ALTER TABLE specialist_profiles ADD COLUMN IF NOT EXISTS primary_category_id BIGINT REFERENCES categories(id)`;
    // Активируем услуги, которые застряли в pending (модерация UI пока не реализована)
    await sql`UPDATE services SET status = 'active' WHERE status = 'pending'`;
    _migrationsRan = true;
    console.log("[migrations] applied");
  } catch (e: any) {
    console.error("[migrations] failed:", e?.message || e);
  }
}

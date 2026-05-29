/**
 * Mutaxassis profili statusi va to'ldirilganlik foizini avtomatik qayta hisoblash.
 *
 * Status chegaralari (spec bo'yicha):
 *   candidate — standart
 *   master    — 3+ bitim va profil to'ldirilgan (bio, city, specialization, kamida 1 xizmat)
 *   expert    — 10+ bitim va rating >= 4.5
 *   top       — 25+ bitim va rating >= 4.8
 *
 * Profil to'ldirilganligi (0..100) — har bir mavjud band 20 ball:
 *   bio, city, specialization, xizmat (>=1), portfolio (>=1)
 */
import { getDb } from "../queries/connection";

export type SpecialistStatus = "candidate" | "master" | "expert" | "top";

function computeStatus(totalDeals: number, rating: number, completion: number): SpecialistStatus {
  if (totalDeals >= 25 && rating >= 4.8) return "top";
  if (totalDeals >= 10 && rating >= 4.5) return "expert";
  if (totalDeals >= 3 && completion >= 80) return "master";
  return "candidate";
}

export interface RecalcResult {
  status: SpecialistStatus;
  previousStatus: SpecialistStatus | null;
  profileCompletion: number;
  changed: boolean;
}

/**
 * specialistUserId — bu users.id (specialist_profiles.user_id bilan bir xil)
 */
export async function recalcSpecialist(specialistUserId: number): Promise<RecalcResult | null> {
  const sql = getDb();

  const rows = await sql`
    SELECT
      u.bio,
      u.city,
      sp.specialization,
      sp.status AS current_status,
      sp.total_deals,
      CAST(sp.rating AS float) AS rating,
      (SELECT COUNT(*)::int FROM services WHERE user_id = u.id AND status = 'active') AS services_count,
      (SELECT COUNT(*)::int FROM portfolios WHERE user_id = u.id) AS portfolios_count
    FROM users u
    JOIN specialist_profiles sp ON sp.user_id = u.id
    WHERE u.id = ${specialistUserId}
  `;
  if (!rows.length) return null;
  const r = rows[0] as any;

  let completion = 0;
  if (r.bio && String(r.bio).trim().length > 0) completion += 20;
  if (r.city && String(r.city).trim().length > 0) completion += 20;
  if (r.specialization && String(r.specialization).trim().length > 0) completion += 20;
  if (Number(r.services_count) >= 1) completion += 20;
  if (Number(r.portfolios_count) >= 1) completion += 20;

  const totalDeals = Number(r.total_deals || 0);
  const rating = Number(r.rating || 0);
  const previous = (r.current_status || "candidate") as SpecialistStatus;
  const status = computeStatus(totalDeals, rating, completion);

  await sql`
    UPDATE specialist_profiles
    SET status = ${status}, updated_at = NOW()
    WHERE user_id = ${specialistUserId}
  `;
  await sql`
    UPDATE users
    SET profile_completion = ${completion}, updated_at = NOW()
    WHERE id = ${specialistUserId}
  `;

  return {
    status,
    previousStatus: previous,
    profileCompletion: completion,
    changed: previous !== status,
  };
}

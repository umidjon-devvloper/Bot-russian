import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";

export const statsRouter = createRouter({
  overview: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM specialist_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.is_visible = true AND u.is_blocked = false) AS total_specialists,
        (SELECT COUNT(*)::int FROM customer_profiles) AS total_customers,
        (SELECT COUNT(*)::int FROM services WHERE status = 'active') AS total_services,
        (SELECT COUNT(*)::int FROM reviews WHERE status = 'active') AS total_reviews,
        (SELECT COUNT(*)::int FROM contacts) AS total_contacts,
        (SELECT COUNT(*)::int FROM tenders WHERE status = 'active') AS total_tenders,
        (SELECT COUNT(*)::int FROM deals) AS total_deals
    `;
    const r = rows[0] as any;
    return {
      totalUsers: r.total_users,
      totalSpecialists: r.total_specialists,
      totalCustomers: r.total_customers,
      totalServices: r.total_services,
      totalReviews: r.total_reviews,
      totalContacts: r.total_contacts,
      totalTenders: r.total_tenders,
      totalDeals: r.total_deals,
    };
  }),

  dashboard: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM specialist_profiles) AS total_specialists,
        (SELECT COUNT(*)::int FROM customer_profiles) AS total_customers,
        (SELECT COUNT(*)::int FROM services WHERE status = 'active') AS total_services,
        (SELECT COUNT(*)::int FROM reviews) AS total_reviews,
        (SELECT COUNT(*)::int FROM contacts) AS total_contacts,
        (SELECT COUNT(*)::int FROM tenders) AS total_tenders,
        (SELECT COUNT(*)::int FROM deals) AS total_deals,
        (SELECT COALESCE(SUM(CAST(amount AS float)), 0) FROM deals WHERE status = 'completed') AS deals_volume
    `;
    const r = rows[0] as any;
    return {
      totalUsers: r.total_users,
      totalSpecialists: r.total_specialists,
      totalCustomers: r.total_customers,
      totalServices: r.total_services,
      totalReviews: r.total_reviews,
      totalContacts: r.total_contacts,
      totalTenders: r.total_tenders,
      totalDeals: r.total_deals,
      totalDealsVolume: Number(r.deals_volume),
    };
  }),

  moderationQueue: publicQuery.query(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM services WHERE status = 'pending') AS pending_services,
        (SELECT COUNT(*)::int FROM reviews WHERE status = 'pending') AS pending_reviews,
        (SELECT COUNT(*)::int FROM verifications WHERE status = 'pending') AS pending_verifications,
        (SELECT COUNT(*)::int FROM channel_publications WHERE status = 'pending') AS pending_vacancies
    `;
    const r = rows[0] as any;
    return {
      pendingServices: r.pending_services,
      pendingReviews: r.pending_reviews,
      pendingVerifications: r.pending_verifications,
      pendingVacancies: r.pending_vacancies,
      totalPending: r.pending_services + r.pending_reviews + r.pending_verifications + r.pending_vacancies,
    };
  }),
});

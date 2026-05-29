import { getDb } from "../api/queries/connection";

async function main() {
  const db = getDb();
  const tables = [
    "moderation_log",
    "notifications",
    "favorites",
    "auto_post_templates",
    "topics",
    "escrow_transactions",
    "interviews",
    "subscriptions",
    "channel_publications",
    "contacts",
    "verifications",
    "review_images",
    "reviews",
    "external_links",
    "portfolio_images",
    "portfolios",
    "service_images",
    "services",
    "tenders",
    "categories",
    "customer_profiles",
    "specialist_profiles",
    "users",
  ];

  for (const table of tables) {
    try {
      await db.execute(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped ${table}`);
    } catch (e) {
      console.log(`Error dropping ${table}:`, e);
    }
  }
}

main().catch(console.error);

import { getDb } from "../api/queries/connection";

async function clear() {
  const db = getDb();
  const tables = [
    "auto_post_templates", "topics", "tenders", "subscriptions",
    "escrow_transactions", "contacts", "review_images", "reviews",
    "external_links", "portfolio_images", "portfolios", "service_images",
    "services", "categories", "interviews", "verifications",
    "channel_publications", "moderation_log", "notifications", "favorites",
    "customer_profiles", "specialist_profiles", "users",
  ];
  for (const t of tables) {
    try {
      await db.execute(`DELETE FROM \`${t}\``);
      console.log(`Cleared ${t}`);
    } catch (e: any) {
      console.log(`Skip ${t}: ${e.message?.slice(0, 50)}`);
    }
  }
  console.log("All tables cleared");
}
clear().catch(console.error);

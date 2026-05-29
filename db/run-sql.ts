import { createConnection } from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await createConnection(dbUrl);
  const sql = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf-8");

  for (const statement of sql.split(";")) {
    const trimmed = statement.trim();
    if (!trimmed) continue;
    try {
      await connection.execute(trimmed);
      console.log("Executed:", trimmed.slice(0, 60) + "...");
    } catch (e: any) {
      console.log("Error:", e.message?.slice(0, 100));
    }
  }

  await connection.end();
  console.log("Seed complete!");
}

main().catch(console.error);

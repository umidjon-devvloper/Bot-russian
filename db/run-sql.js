const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const connection = await mysql.createConnection(dbUrl);
  const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');

  for (const statement of sql.split(';')) {
    const trimmed = statement.trim();
    if (!trimmed || trimmed.startsWith('--')) continue;
    try {
      await connection.execute(trimmed);
      console.log('OK:', trimmed.slice(0, 50) + '...');
    } catch (e) {
      console.log('ERR:', e.message?.slice(0, 100), '|', trimmed.slice(0, 40));
    }
  }

  await connection.end();
  console.log('Seed complete!');
}

main().catch(console.error);

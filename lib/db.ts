import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");
  return neon(url);
}

export async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id   TEXT PRIMARY KEY,
      candidates  JSONB NOT NULL DEFAULT '[]',
      departments JSONB NOT NULL DEFAULT '[]'
    )
  `;
}

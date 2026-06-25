import { neon } from "@neondatabase/serverless";

export function getDb() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL が設定されていません");
  // channel_binding パラメータは @neondatabase/serverless 非対応のため除去
  const url = raw.replace(/[&?]channel_binding=[^&]*/g, "").replace(/\?&/, "?");
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

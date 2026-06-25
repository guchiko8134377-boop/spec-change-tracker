import { NextResponse } from "next/server";
import { getDb, ensureTable } from "@/lib/db";
import positionsData from "@/data/positions.json";
import candidatesData from "@/data/candidates.json";

const STATE_ID = "main";

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT * FROM app_state WHERE id = ${STATE_ID}`;

    if (rows.length === 0) {
      // 初回アクセス時：JSONファイルのデータをDBに保存してから返す
      await sql`
        INSERT INTO app_state (id, candidates, departments)
        VALUES (
          ${STATE_ID},
          ${JSON.stringify(candidatesData)},
          ${JSON.stringify(positionsData)}
        )
      `;
      return NextResponse.json({
        candidates: candidatesData,
        departments: positionsData,
      });
    }

    return NextResponse.json({
      candidates: rows[0].candidates,
      departments: rows[0].departments,
    });
  } catch (err) {
    console.error("GET /api/state error:", err);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const sql = getDb();
    const body = await request.json();
    const { candidates, departments } = body;

    await sql`
      INSERT INTO app_state (id, candidates, departments)
      VALUES (${STATE_ID}, ${JSON.stringify(candidates)}, ${JSON.stringify(departments)})
      ON CONFLICT (id) DO UPDATE
        SET candidates  = EXCLUDED.candidates,
            departments = EXCLUDED.departments
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/state error:", err);
    return NextResponse.json(
      { error: "データの保存に失敗しました" },
      { status: 500 }
    );
  }
}

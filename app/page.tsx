export const dynamic = "force-dynamic";

import { Workspace } from "@/components/workspace/Workspace";
import positionsData from "@/data/positions.json";
import candidatesData from "@/data/candidates.json";
import workspaceData from "@/data/workspace.json";
import {
  departmentsSchema,
  candidatesSchema,
  workspaceSchema,
} from "@/lib/schema";
import { getDb, ensureTable } from "@/lib/db";

async function loadState() {
  // DATABASE_URL が未設定の場合はJSONファイルにフォールバック（ローカル開発用）
  if (!process.env.DATABASE_URL) {
    return { departments: positionsData, candidates: candidatesData };
  }

  try {
    await ensureTable();
    const sql = getDb();
    const rows =
      await sql`SELECT candidates, departments FROM app_state WHERE id = 'main'`;

    if (rows.length === 0) {
      // 初回：JSONデータをDBに書き込んでからそのまま使う
      await sql`
        INSERT INTO app_state (id, candidates, departments)
        VALUES ('main', ${JSON.stringify(candidatesData)}, ${JSON.stringify(positionsData)})
      `;
      return { departments: positionsData, candidates: candidatesData };
    }

    return {
      departments: rows[0].departments,
      candidates: rows[0].candidates,
    };
  } catch (err) {
    console.error("DB読み込みエラー（JSONにフォールバック）:", err);
    return { departments: positionsData, candidates: candidatesData };
  }
}

export default async function Page() {
  const { departments, candidates } = await loadState();

  const deptResult = departmentsSchema.safeParse(departments);
  const candResult = candidatesSchema.safeParse(candidates);
  const wsResult = workspaceSchema.safeParse(workspaceData);

  if (!deptResult.success || !candResult.success || !wsResult.success) {
    const errors = [
      !deptResult.success &&
        `positions: ${deptResult.error.issues[0]?.message}`,
      !candResult.success &&
        `candidates: ${candResult.error.issues[0]?.message}`,
      !wsResult.success && `workspace: ${wsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  return (
    <Workspace
      initialDepartments={deptResult.data}
      initialCandidates={candResult.data}
      workspace={wsResult.data}
    />
  );
}

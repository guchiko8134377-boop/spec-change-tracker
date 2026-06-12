/**
 * 雛形の表示文言（labels）。
 *
 * 仕様変更 更新管理ツール用にカスタマイズ済み。
 *
 * ステージ = 変更の全体進捗状態
 * 評価軸   = 4つのツール（カタログ / Webサイト / 価格表 / 取扱説明書）
 */

import { type AxisKey, type StageKey } from "@/lib/schema";

// ===== 評価観点（4 軸） =====
// 各ツールへの反映・承認状況を表す（★の数 = 承認ステップ完了度）

export const EVALUATION_AXIS: Record<AxisKey, string> = {
  achievements:   "カタログ",
  thinkingAbility: "Webサイト",
  communication:  "価格表",
  cultureFit:     "取扱説明書",
} as const;

// Pane 2 のグループ見出しに出すステージ表示名。
export const STAGE_LABELS: Record<StageKey, string> = {
  screening: "未申請",
  first:     "対応中",
  second:    "承認待ち",
  final:     "完了",
};

// Pane 2 末尾の「アーカイブ済み」グループの見出しラベル。
export const ARCHIVED_GROUP_LABEL = "アーカイブ済み";

// ===== Pane 3 ダッシュボードのセクション見出し =====

export const PANE3_SECTION = {
  applicationInfo:       "変更内容",
  recruitingConditions:  "登録情報",
  screeningFlow:         "ツール更新フロー",
  screeningFlowDescription: "各ツールの担当者・承認状況",
} as const;

// ===== Pane 4 セクション id =====

export const PANE4_SECTION_IDS = {
  m2: {
    info:        "pane4-m2-info",
    evaluation:  "pane4-m2-evaluation",
    comment:     "pane4-m2-comment",
    summary:     "pane4-m2-summary",
    attachments: "pane4-m2-attachments",
  },
} as const;

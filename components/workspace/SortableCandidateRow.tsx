"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { type CandidateRow, type StageKey } from "@/lib/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Pane 2 のステージグループ用、ドラッグ可能な候補者行。
 *
 * - 行全体クリック = 候補者を選択（onSelect 経由）
 * - 左端のグリップだけが drag listener を持つ。`MoreHorizontal` メニューや
 *   行クリックとは衝突しない（`activationConstraint: distance` でも吸収済み）
 * - DragOverlay 描画中は `isDragging` で半透明 + pointer-events 抑止
 *
 * archived グループの行はドラッグさせないため、本コンポーネントは stage グループ
 * 専用。archived は CandidateListPane 側の通常 `<li>` で描画する。
 */
export function SortableCandidateRow({
  cand,
  stage,
  selected,
  onSelect,
  actions,
}: {
  cand: CandidateRow;
  stage: StageKey;
  selected: boolean;
  onSelect: (id: string) => void;
  actions: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cand.id,
    data: { containerId: stage, name: cand.name },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/candidate relative",
        isDragging && "pointer-events-none opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(cand.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          selected
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span
          {...attributes}
          {...listeners}
          aria-label={`${cand.name} の並び替え`}
          className={cn(
            "flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground",
            "opacity-0 transition-opacity group-focus-within/candidate:opacity-100 group-hover/candidate:opacity-100",
            "hover:text-foreground active:cursor-grabbing",
            "outline-none focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          // ドラッグハンドルだけのクリックで選択動作が走らないようにする
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </span>
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {cand.name[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{cand.name}</p>
          <DeadlineBadge deadlineDate={cand.deadlineDate} />
        </div>
        <span className="transition-opacity group-focus-within/candidate:opacity-0 group-hover/candidate:opacity-0">
          <ScoreBadge avg={cand.averageScore} selected={selected} />
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2",
                "opacity-0 group-focus-within/candidate:opacity-100 group-hover/candidate:opacity-100",
                "transition-opacity",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${cand.name} の操作`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>{actions}</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function DeadlineBadge({ deadlineDate }: { deadlineDate: string }) {
  if (!deadlineDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return (
      <Badge
        variant="destructive"
        className="mt-0.5 h-4 px-1 text-[10px] leading-none"
        aria-label="期日超過"
      >
        期日超過
      </Badge>
    );
  }
  if (diffDays <= 3) {
    return (
      <Badge
        className="mt-0.5 h-4 bg-amber-500 px-1 text-[10px] leading-none text-white hover:bg-amber-500"
        aria-label={`期日まであと${diffDays}日`}
      >
        あと{diffDays}日
      </Badge>
    );
  }
  return null;
}

function ScoreBadge({
  avg,
  selected,
}: {
  avg: number | null;
  selected: boolean;
}) {
  if (avg === null) {
    return (
      <span
        className={cn(
          "shrink-0 text-xs",
          selected ? "text-accent-foreground/80" : "text-muted-foreground",
        )}
        aria-label="未評価"
      >
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 text-xs tabular-nums",
        selected ? "text-accent-foreground" : "text-foreground/80",
      )}
      aria-label={`平均スコア ${avg.toFixed(1)} / 5`}
    >
      <Star aria-hidden className="size-3 fill-current" />
      {avg.toFixed(1)}
    </span>
  );
}

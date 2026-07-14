import type { MatchStage, MatchStatus } from "@/lib/types";

const stageLabels: Record<MatchStage, string> = {
  group: "小组赛",
  r32: "32强",
  r16: "16强",
  qf: "四分之一决赛",
  sf: "半决赛",
  third: "季军赛",
  final: "决赛",
};

export function stageLabel(stage: MatchStage): string {
  return stageLabels[stage];
}

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "未开始",
  live: "进行中",
  finished: "已结束",
};

export function statusLabel(status: MatchStatus): string {
  return statusLabels[status];
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

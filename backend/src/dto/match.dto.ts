export interface MatchResultInput {
  homeScore: number;
  awayScore: number;
}

export function parseMatchResultInput(value: unknown): MatchResultInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }
  const v = value as Record<string, unknown>;
  const homeScore = Number(v.homeScore);
  const awayScore = Number(v.awayScore);
  if (!Number.isInteger(homeScore) || homeScore < 0 || homeScore > 20) {
    throw new TypeError("homeScore 必须是 0-20 的整数");
  }
  if (!Number.isInteger(awayScore) || awayScore < 0 || awayScore > 20) {
    throw new TypeError("awayScore 必须是 0-20 的整数");
  }
  return { homeScore, awayScore };
}

export interface PredictionInput {
  matchId: number;
  homeScore: number;
  awayScore: number;
}

export function parsePredictionInput(value: unknown): PredictionInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }
  const v = value as Record<string, unknown>;
  const matchId = Number(v.matchId);
  const homeScore = Number(v.homeScore);
  const awayScore = Number(v.awayScore);
  if (!Number.isInteger(matchId) || matchId < 1) {
    throw new TypeError("matchId 必须是正整数");
  }
  if (!Number.isInteger(homeScore) || homeScore < 0 || homeScore > 20) {
    throw new TypeError("homeScore 必须是 0-20 的整数");
  }
  if (!Number.isInteger(awayScore) || awayScore < 0 || awayScore > 20) {
    throw new TypeError("awayScore 必须是 0-20 的整数");
  }
  return { matchId, homeScore, awayScore };
}

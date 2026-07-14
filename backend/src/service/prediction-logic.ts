import type { DatabaseSync } from "node:sqlite";
import type { PredictionInput } from "../dto/prediction.dto";

export interface PredictionData {
  id: number;
  userId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  points: number | null;
  createdAt: string;
}

export interface PredictionRepo {
  findPrediction(
    userId: number,
    matchId: number,
  ): Promise<PredictionData | null>;
  insertPrediction(
    userId: number,
    matchId: number,
    homeScore: number,
    awayScore: number,
  ): Promise<PredictionData>;
  updatePrediction(
    userId: number,
    matchId: number,
    homeScore: number,
    awayScore: number,
  ): Promise<PredictionData | null>;
  findMatchStatus(matchId: number): Promise<string | null>;
  listPredictionsByUser(userId: number): Promise<PredictionData[]>;
  calculatePointsForMatch(matchId: number): Promise<number>;
}

interface PredictionRow {
  id: number;
  user_id: number;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  created_at: string;
}

interface MatchStatusRow {
  status: string;
}

interface MatchScoreRow {
  home_score: number | null;
  away_score: number | null;
}

const PREDICTION_SELECT =
  "SELECT id, user_id, match_id, home_score, away_score, points, created_at FROM predictions";

function mapRow(row: PredictionRow): PredictionData {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    points: row.points,
    createdAt: row.created_at,
  };
}

export function scorePrediction(
  predHome: number,
  predAway: number,
  matchHome: number,
  matchAway: number,
): number {
  if (predHome === matchHome && predAway === matchAway) {
    return 3;
  }
  const predDir = Math.sign(predHome - predAway);
  const matchDir = Math.sign(matchHome - matchAway);
  if (predDir === matchDir) {
    return 1;
  }
  return 0;
}

export function createPredictionLockedError(): Error {
  const err = new Error("比赛已开始，无法修改预测");
  Object.assign(err, { code: "PREDICTION_LOCKED", status: 409 });
  return err;
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message);
}

export function createPredictionRepo(db: DatabaseSync): PredictionRepo {
  const fetchById = (id: number): PredictionData | null => {
    const row = db.prepare(`${PREDICTION_SELECT} WHERE id = ?`).get(id) as
      PredictionRow | undefined;
    return row ? mapRow(row) : null;
  };

  const fetchByUserMatch = (
    userId: number,
    matchId: number,
  ): PredictionData | null => {
    const row = db
      .prepare(`${PREDICTION_SELECT} WHERE user_id = ? AND match_id = ?`)
      .get(userId, matchId) as PredictionRow | undefined;
    return row ? mapRow(row) : null;
  };

  return {
    async findPrediction(
      userId: number,
      matchId: number,
    ): Promise<PredictionData | null> {
      return fetchByUserMatch(userId, matchId);
    },
    async insertPrediction(
      userId: number,
      matchId: number,
      homeScore: number,
      awayScore: number,
    ): Promise<PredictionData> {
      const result = db
        .prepare(
          "INSERT INTO predictions (user_id, match_id, home_score, away_score) VALUES (?, ?, ?, ?)",
        )
        .run(userId, matchId, homeScore, awayScore);
      return fetchById(Number(result.lastInsertRowid))!;
    },
    async updatePrediction(
      userId: number,
      matchId: number,
      homeScore: number,
      awayScore: number,
    ): Promise<PredictionData | null> {
      const result = db
        .prepare(
          `UPDATE predictions SET home_score = ?, away_score = ?
           WHERE user_id = ? AND match_id = ?
             AND (SELECT status FROM matches WHERE id = ?) = 'scheduled'`,
        )
        .run(homeScore, awayScore, userId, matchId, matchId);
      if (result.changes === 0) {
        return null;
      }
      return fetchByUserMatch(userId, matchId);
    },
    async findMatchStatus(matchId: number): Promise<string | null> {
      const row = db
        .prepare("SELECT status FROM matches WHERE id = ?")
        .get(matchId) as MatchStatusRow | undefined;
      return row ? row.status : null;
    },
    async listPredictionsByUser(userId: number): Promise<PredictionData[]> {
      const rows = db
        .prepare(`${PREDICTION_SELECT} WHERE user_id = ? ORDER BY id ASC`)
        .all(userId) as unknown as PredictionRow[];
      return rows.map(mapRow);
    },
    async calculatePointsForMatch(matchId: number): Promise<number> {
      const match = db
        .prepare("SELECT home_score, away_score FROM matches WHERE id = ?")
        .get(matchId) as MatchScoreRow | undefined;
      if (!match || match.home_score === null || match.away_score === null) {
        return 0;
      }
      const predictions = db
        .prepare(`${PREDICTION_SELECT} WHERE match_id = ?`)
        .all(matchId) as unknown as PredictionRow[];
      const updateStmt = db.prepare(
        "UPDATE predictions SET points = ? WHERE id = ?",
      );
      let count = 0;
      for (const pred of predictions) {
        const points = scorePrediction(
          pred.home_score,
          pred.away_score,
          match.home_score,
          match.away_score,
        );
        updateStmt.run(points, pred.id);
        count += 1;
      }
      return count;
    },
  };
}

export async function submitPredictionLogic(
  repo: PredictionRepo,
  userId: number,
  input: PredictionInput,
): Promise<PredictionData> {
  const status = await repo.findMatchStatus(input.matchId);
  if (status !== "scheduled") {
    throw createPredictionLockedError();
  }
  const existing = await repo.findPrediction(userId, input.matchId);
  if (!existing) {
    try {
      return await repo.insertPrediction(
        userId,
        input.matchId,
        input.homeScore,
        input.awayScore,
      );
    } catch (err) {
      if (!isUniqueViolation(err)) {
        throw err;
      }
      const updated = await repo.updatePrediction(
        userId,
        input.matchId,
        input.homeScore,
        input.awayScore,
      );
      if (!updated) {
        throw createPredictionLockedError();
      }
      return updated;
    }
  }
  const updated = await repo.updatePrediction(
    userId,
    input.matchId,
    input.homeScore,
    input.awayScore,
  );
  if (!updated) {
    throw createPredictionLockedError();
  }
  return updated;
}

export async function calculatePointsLogic(
  repo: PredictionRepo,
  matchId: number,
): Promise<number> {
  const status = await repo.findMatchStatus(matchId);
  if (status !== "finished") {
    return 0;
  }
  return repo.calculatePointsForMatch(matchId);
}

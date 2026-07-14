import type { DatabaseSync } from "node:sqlite";

export interface FavoriteTeamData {
  id: number;
  name: string;
  code: string;
  flagUrl: string | null;
}

export interface FavoriteMatchData {
  id: number;
  stage: string;
  group: string | null;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeTeam: FavoriteTeamData | null;
  awayTeam: FavoriteTeamData | null;
}

export interface FavoriteData {
  id: number;
  userId: number;
  matchId: number;
  createdAt: string;
  match: FavoriteMatchData | null;
}

export interface FavoriteRepo {
  findFavorite(
    userId: number,
    matchId: number,
  ): Promise<FavoriteData | null>;
  insertFavorite(userId: number, matchId: number): Promise<FavoriteData>;
  listFavorites(userId: number): Promise<FavoriteData[]>;
  removeFavorite(userId: number, matchId: number): Promise<void>;
}

interface FavoriteRow {
  id: number;
  user_id: number;
  match_id: number;
  created_at: string;
  m_id: number | null;
  m_stage: string | null;
  m_group: string | null;
  m_kickoff_time: string | null;
  m_home_score: number | null;
  m_away_score: number | null;
  m_status: string | null;
  ht_id: number | null;
  ht_name: string | null;
  ht_code: string | null;
  ht_flag_url: string | null;
  aw_id: number | null;
  aw_name: string | null;
  aw_code: string | null;
  aw_flag_url: string | null;
}

const FAVORITE_SELECT = `
  SELECT
    f.id, f.user_id, f.match_id, f.created_at,
    m.id AS m_id, m.stage AS m_stage, m."group" AS m_group, m.kickoff_time AS m_kickoff_time,
    m.home_score AS m_home_score, m.away_score AS m_away_score, m.status AS m_status,
    ht.id AS ht_id, ht.name AS ht_name, ht.code AS ht_code, ht.flag_url AS ht_flag_url,
    aw.id AS aw_id, aw.name AS aw_name, aw.code AS aw_code, aw.flag_url AS aw_flag_url
  FROM favorites f
  LEFT JOIN matches m ON m.id = f.match_id
  LEFT JOIN teams ht ON ht.id = m.home_team_id
  LEFT JOIN teams aw ON aw.id = m.away_team_id
`;

function mapTeam(
  id: number | null,
  name: string | null,
  code: string | null,
  flagUrl: string | null,
): FavoriteTeamData | null {
  if (id == null) {
    return null;
  }
  return {
    id,
    name: name ?? "",
    code: code ?? "",
    flagUrl,
  };
}

function mapRow(row: FavoriteRow): FavoriteData {
  const match: FavoriteMatchData | null =
    row.m_id == null
      ? null
      : {
          id: row.m_id,
          stage: row.m_stage ?? "",
          group: row.m_group,
          kickoffTime: row.m_kickoff_time ?? "",
          homeScore: row.m_home_score,
          awayScore: row.m_away_score,
          status: row.m_status ?? "",
          homeTeam: mapTeam(
            row.ht_id,
            row.ht_name,
            row.ht_code,
            row.ht_flag_url,
          ),
          awayTeam: mapTeam(
            row.aw_id,
            row.aw_name,
            row.aw_code,
            row.aw_flag_url,
          ),
        };
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    createdAt: row.created_at,
    match,
  };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Error && /UNIQUE constraint failed/i.test(err.message)
  );
}

export function createFavoriteRepo(db: DatabaseSync): FavoriteRepo {
  const fetchByUserMatch = (
    userId: number,
    matchId: number,
  ): FavoriteData | null => {
    const row = db
      .prepare(`${FAVORITE_SELECT} WHERE f.user_id = ? AND f.match_id = ?`)
      .get(userId, matchId) as FavoriteRow | undefined;
    return row ? mapRow(row) : null;
  };

  return {
    async findFavorite(
      userId: number,
      matchId: number,
    ): Promise<FavoriteData | null> {
      return fetchByUserMatch(userId, matchId);
    },
    async insertFavorite(
      userId: number,
      matchId: number,
    ): Promise<FavoriteData> {
      const result = db
        .prepare(
          "INSERT INTO favorites (user_id, match_id) VALUES (?, ?)",
        )
        .run(userId, matchId);
      return fetchByUserMatch(userId, matchId)!;
    },
    async listFavorites(userId: number): Promise<FavoriteData[]> {
      const rows = db
        .prepare(`${FAVORITE_SELECT} WHERE f.user_id = ? ORDER BY f.id ASC`)
        .all(userId) as unknown as FavoriteRow[];
      return rows.map(mapRow);
    },
    async removeFavorite(
      userId: number,
      matchId: number,
    ): Promise<void> {
      db.prepare(
        "DELETE FROM favorites WHERE user_id = ? AND match_id = ?",
      ).run(userId, matchId);
    },
  };
}

export async function addFavoriteLogic(
  repo: FavoriteRepo,
  userId: number,
  matchId: number,
): Promise<FavoriteData> {
  try {
    return await repo.insertFavorite(userId, matchId);
  } catch (err) {
    if (!isUniqueViolation(err)) {
      throw err;
    }
    const existing = await repo.findFavorite(userId, matchId);
    if (!existing) {
      throw err;
    }
    return existing;
  }
}

export async function listFavoritesLogic(
  repo: FavoriteRepo,
  userId: number,
): Promise<FavoriteData[]> {
  return repo.listFavorites(userId);
}

export async function removeFavoriteLogic(
  repo: FavoriteRepo,
  userId: number,
  matchId: number,
): Promise<void> {
  await repo.removeFavorite(userId, matchId);
}

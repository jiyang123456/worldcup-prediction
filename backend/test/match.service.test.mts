import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  computeStandings,
  getMatch,
  getStandings,
  listMatches,
  type MatchData,
  type MatchRepo,
  type TeamData,
} from "../src/service/match-logic.ts";

interface MatchRow {
  id: number;
  stage: string;
  match_group: string | null;
  kickoff_time: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  home_id: number;
  home_name: string;
  home_code: string;
  home_group: string | null;
  home_flag_url: string | null;
  away_id: number;
  away_name: string;
  away_code: string;
  away_group: string | null;
  away_flag_url: string | null;
}

interface TeamRow {
  id: number;
  name: string;
  code: string;
  group: string | null;
  flag_url: string | null;
}

const MATCH_SELECT = `
  SELECT
    m.id, m.stage, m."group" AS match_group, m.kickoff_time, m.home_score, m.away_score, m.status,
    ht.id AS home_id, ht.name AS home_name, ht.code AS home_code, ht."group" AS home_group, ht.flag_url AS home_flag_url,
    aw.id AS away_id, aw.name AS away_name, aw.code AS away_code, aw."group" AS away_group, aw.flag_url AS away_flag_url
  FROM matches m
  JOIN teams ht ON ht.id = m.home_team_id
  JOIN teams aw ON aw.id = m.away_team_id
`;

function mapMatchRow(row: MatchRow): MatchData {
  return {
    id: row.id,
    homeTeam: {
      id: row.home_id,
      name: row.home_name,
      code: row.home_code,
      group: row.home_group,
      flagUrl: row.home_flag_url,
    },
    awayTeam: {
      id: row.away_id,
      name: row.away_name,
      code: row.away_code,
      group: row.away_group,
      flagUrl: row.away_flag_url,
    },
    stage: row.stage,
    group: row.match_group,
    kickoffTime: new Date(row.kickoff_time),
    homeScore: row.home_score,
    awayScore: row.away_score,
    status: row.status,
  };
}

function mapTeamRow(row: TeamRow): TeamData {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    group: row.group,
    flagUrl: row.flag_url,
  };
}

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      "group" TEXT,
      flag_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      home_team_id INTEGER NOT NULL,
      away_team_id INTEGER NOT NULL,
      stage TEXT NOT NULL,
      "group" TEXT,
      kickoff_time TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (home_team_id) REFERENCES teams(id),
      FOREIGN KEY (away_team_id) REFERENCES teams(id)
    );
  `);
}

function insertTeam(
  db: DatabaseSync,
  name: string,
  code: string,
  group: string | null,
): number {
  const result = db
    .prepare(
      'INSERT INTO teams (name, code, "group", flag_url) VALUES (?, ?, ?, NULL)',
    )
    .run(name, code, group);
  return Number(result.lastInsertRowid);
}

function insertMatch(
  db: DatabaseSync,
  homeTeamId: number,
  awayTeamId: number,
  stage: string,
  group: string | null,
  kickoffTime: string,
  homeScore: number | null,
  awayScore: number | null,
  status: string,
): number {
  const result = db
    .prepare(
      `INSERT INTO matches (home_team_id, away_team_id, stage, "group", kickoff_time, home_score, away_score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      homeTeamId,
      awayTeamId,
      stage,
      group,
      kickoffTime,
      homeScore,
      awayScore,
      status,
    );
  return Number(result.lastInsertRowid);
}

function createRepo(db: DatabaseSync): MatchRepo {
  const fetchMatchById = (id: number): MatchData | null => {
    const row = db.prepare(`${MATCH_SELECT} WHERE m.id = ?`).get(id) as
      | MatchRow
      | undefined;
    return row ? mapMatchRow(row) : null;
  };

  return {
    async findMatches(stage?: string, status?: string): Promise<MatchData[]> {
      let sql = MATCH_SELECT;
      const params: (string | number)[] = [];
      const conditions: string[] = [];
      if (stage) {
        conditions.push("m.stage = ?");
        params.push(stage);
      }
      if (status) {
        conditions.push("m.status = ?");
        params.push(status);
      }
      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }
      sql += " ORDER BY m.kickoff_time ASC";
      const rows = db.prepare(sql).all(...params) as MatchRow[];
      return rows.map(mapMatchRow);
    },
    async findMatchById(id: number): Promise<MatchData | null> {
      return fetchMatchById(id);
    },
    async findFinishedGroupMatches(group?: string): Promise<MatchData[]> {
      let sql = `${MATCH_SELECT} WHERE m.stage = 'group' AND m.status = 'finished'`;
      const params: (string | number)[] = [];
      if (group) {
        sql += ` AND m."group" = ?`;
        params.push(group);
      }
      const rows = db.prepare(sql).all(...params) as MatchRow[];
      return rows.map(mapMatchRow);
    },
    async findAllTeams(): Promise<TeamData[]> {
      const rows = db
        .prepare(
          'SELECT id, name, code, "group", flag_url FROM teams ORDER BY name ASC',
        )
        .all() as TeamRow[];
      return rows.map(mapTeamRow);
    },
    async findTeamById(id: number): Promise<TeamData | null> {
      const row = db
        .prepare(
          'SELECT id, name, code, "group", flag_url FROM teams WHERE id = ?',
        )
        .get(id) as TeamRow | undefined;
      return row ? mapTeamRow(row) : null;
    },
    async updateMatchResult(
      id: number,
      homeScore: number,
      awayScore: number,
    ): Promise<MatchData | null> {
      const result = db
        .prepare(
          "UPDATE matches SET home_score = ?, away_score = ?, status = 'finished' WHERE id = ?",
        )
        .run(homeScore, awayScore, id);
      if (result.changes === 0) {
        return null;
      }
      return fetchMatchById(id);
    },
  };
}

function setup(): { db: DatabaseSync; repo: MatchRepo } {
  const db = new DatabaseSync(":memory:");
  createTables(db);
  return { db, repo: createRepo(db) };
}

test("listMatches returns all matches", async () => {
  const { db, repo } = setup();
  const t1 = insertTeam(db, "Mexico", "MEX", "A");
  const t2 = insertTeam(db, "Canada", "CAN", "A");
  insertMatch(
    db,
    t1,
    t2,
    "group",
    "A",
    "2026-06-11T13:00:00.000Z",
    null,
    null,
    "scheduled",
  );
  insertMatch(
    db,
    t2,
    t1,
    "r16",
    null,
    "2026-07-04T16:00:00.000Z",
    null,
    null,
    "scheduled",
  );
  const matches = await listMatches(repo);
  assert.equal(matches.length, 2);
  db.close();
});

test("listMatches filters by stage", async () => {
  const { db, repo } = setup();
  const t1 = insertTeam(db, "Mexico", "MEX", "A");
  const t2 = insertTeam(db, "Canada", "CAN", "A");
  insertMatch(
    db,
    t1,
    t2,
    "group",
    "A",
    "2026-06-11T13:00:00.000Z",
    null,
    null,
    "scheduled",
  );
  insertMatch(
    db,
    t2,
    t1,
    "r16",
    null,
    "2026-07-04T16:00:00.000Z",
    null,
    null,
    "scheduled",
  );
  const groupMatches = await listMatches(repo, "group");
  assert.equal(groupMatches.length, 1);
  assert.equal(groupMatches[0].stage, "group");
  db.close();
});

test("getMatch returns match by id with team relations", async () => {
  const { db, repo } = setup();
  const t1 = insertTeam(db, "Mexico", "MEX", "A");
  const t2 = insertTeam(db, "Canada", "CAN", "A");
  const matchId = insertMatch(
    db,
    t1,
    t2,
    "group",
    "A",
    "2026-06-11T13:00:00.000Z",
    2,
    1,
    "finished",
  );
  const match = await getMatch(repo, matchId);
  assert.ok(match, "match should be found");
  assert.equal(match!.homeTeam.name, "Mexico");
  assert.equal(match!.awayTeam.code, "CAN");
  assert.equal(match!.homeScore, 2);
  assert.equal(match!.awayScore, 1);
  db.close();
});

test("getStandings calculates points correctly (win=3, draw=1, loss=0)", async () => {
  const { db, repo } = setup();
  const a = insertTeam(db, "Team A", "TEAA", "A");
  const b = insertTeam(db, "Team B", "TEAB", "A");
  const c = insertTeam(db, "Team C", "TEAC", "A");
  const d = insertTeam(db, "Team D", "TEAD", "A");
  insertMatch(
    db,
    a,
    b,
    "group",
    "A",
    "2026-06-11T13:00:00.000Z",
    3,
    1,
    "finished",
  );
  insertMatch(
    db,
    c,
    d,
    "group",
    "A",
    "2026-06-11T16:00:00.000Z",
    2,
    2,
    "finished",
  );
  const standings = await getStandings(repo, "A");
  const byCode = new Map(standings.map((s) => [s.teamCode, s]));
  assert.equal(byCode.get("TEAA")!.points, 3);
  assert.equal(byCode.get("TEAA")!.won, 1);
  assert.equal(byCode.get("TEAB")!.points, 0);
  assert.equal(byCode.get("TEAB")!.lost, 1);
  assert.equal(byCode.get("TEAC")!.points, 1);
  assert.equal(byCode.get("TEAC")!.drawn, 1);
  assert.equal(byCode.get("TEAD")!.points, 1);
  assert.equal(byCode.get("TEAD")!.drawn, 1);
  db.close();
});

test("getStandings returns empty for group with no finished matches", async () => {
  const { db, repo } = setup();
  const a = insertTeam(db, "Team A", "TEAA", "A");
  const b = insertTeam(db, "Team B", "TEAB", "A");
  insertMatch(
    db,
    a,
    b,
    "group",
    "A",
    "2026-06-11T13:00:00.000Z",
    null,
    null,
    "scheduled",
  );
  const standings = await getStandings(repo, "A");
  assert.equal(standings.length, 0);
  db.close();
});

test("getStandings sorts by points > goalDifference > goalsFor > teamName", async () => {
  const { db, repo } = setup();
  const a = insertTeam(db, "Alpha", "ALP", "A");
  const b = insertTeam(db, "Bravo", "BRA", "A");
  const c = insertTeam(db, "Charlie", "CHA", "A");
  const d = insertTeam(db, "Delta", "DEL", "A");
  const e = insertTeam(db, "Echo", "ECH", "A");
  const d6 = insertTeam(db, "Dummy6", "DM6", "A");
  const d7 = insertTeam(db, "Dummy7", "DM7", "A");
  const d8 = insertTeam(db, "Dummy8", "DM8", "A");
  const d9 = insertTeam(db, "Dummy9", "DM9", "A");
  const d10 = insertTeam(db, "Dummy10", "DM10", "A");

  insertMatch(db, a, d6, "group", "A", "2026-06-11T13:00:00.000Z", 2, 0, "finished");
  insertMatch(db, a, d7, "group", "A", "2026-06-11T16:00:00.000Z", 1, 0, "finished");
  insertMatch(db, b, d8, "group", "A", "2026-06-12T13:00:00.000Z", 3, 0, "finished");
  insertMatch(db, d9, b, "group", "A", "2026-06-12T16:00:00.000Z", 1, 0, "finished");
  insertMatch(db, c, d10, "group", "A", "2026-06-13T13:00:00.000Z", 4, 1, "finished");
  insertMatch(db, d6, c, "group", "A", "2026-06-13T16:00:00.000Z", 3, 0, "finished");
  insertMatch(db, d, d7, "group", "A", "2026-06-14T13:00:00.000Z", 2, 1, "finished");
  insertMatch(db, d8, d, "group", "A", "2026-06-14T16:00:00.000Z", 1, 0, "finished");
  insertMatch(db, e, d9, "group", "A", "2026-06-15T13:00:00.000Z", 2, 0, "finished");
  insertMatch(db, d10, e, "group", "A", "2026-06-15T16:00:00.000Z", 2, 0, "finished");

  const standings = await getStandings(repo, "A");
  const realIds = [a, b, c, d, e];
  const ordered = standings.filter((s) => realIds.includes(s.teamId));
  assert.deepEqual(
    ordered.map((s) => s.teamCode),
    ["ALP", "BRA", "CHA", "DEL", "ECH"],
  );
  db.close();
});

test("computeStandings ignores non-finished and unscored matches", () => {
  const home: TeamData = { id: 1, name: "Home", code: "HOM", group: "A", flagUrl: null };
  const away: TeamData = { id: 2, name: "Away", code: "AWY", group: "A", flagUrl: null };
  const matches: MatchData[] = [
    { id: 1, homeTeam: home, awayTeam: away, stage: "group", group: "A", kickoffTime: new Date(), homeScore: 3, awayScore: 0, status: "scheduled" },
    { id: 2, homeTeam: home, awayTeam: away, stage: "group", group: "A", kickoffTime: new Date(), homeScore: null, awayScore: null, status: "finished" },
    { id: 3, homeTeam: home, awayTeam: away, stage: "group", group: "A", kickoffTime: new Date(), homeScore: 1, awayScore: 1, status: "finished" },
  ];
  const standings = computeStandings(matches);
  const byCode = new Map(standings.map((s) => [s.teamCode, s]));
  assert.equal(byCode.get("HOM")!.played, 1);
  assert.equal(byCode.get("AWY")!.played, 1);
  assert.equal(byCode.get("HOM")!.points, 1);
  assert.equal(byCode.get("AWY")!.points, 1);
});

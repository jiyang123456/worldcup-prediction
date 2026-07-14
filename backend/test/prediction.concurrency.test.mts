import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createPredictionRepo,
  submitPredictionLogic,
  type PredictionRepo,
} from "../src/service/prediction-logic.ts";
import { parsePredictionInput } from "../src/dto/prediction.dto.ts";

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      home_score INTEGER NOT NULL,
      away_score INTEGER NOT NULL,
      points INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, match_id)
    );
  `);
}

function insertUser(db: DatabaseSync, username: string): number {
  const result = db
    .prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')",
    )
    .run(username, "hash");
  return Number(result.lastInsertRowid);
}

function insertMatch(
  db: DatabaseSync,
  status: string,
  homeScore: number | null = null,
  awayScore: number | null = null,
): number {
  const result = db
    .prepare(
      `INSERT INTO matches (home_team_id, away_team_id, stage, "group", kickoff_time, home_score, away_score, status)
       VALUES (1, 2, 'group', 'A', '2026-06-11T13:00:00.000Z', ?, ?, ?)`,
    )
    .run(homeScore, awayScore, status);
  return Number(result.lastInsertRowid);
}

let db: DatabaseSync;
let repo: PredictionRepo;

before(() => {
  db = new DatabaseSync(":memory:");
  createTables(db);
  repo = createPredictionRepo(db);
});

after(() => {
  db?.close();
});

test("CT-01: 10 concurrent submissions for same user+match → only 1 record", async () => {
  const userId = insertUser(db, "ct01-user");
  const matchId = insertMatch(db, "scheduled");
  const inputs = Array.from({ length: 10 }, (_, i) =>
    parsePredictionInput({ matchId, homeScore: i, awayScore: i }),
  );
  const results = await Promise.all(
    inputs.map((input) => submitPredictionLogic(repo, userId, input)),
  );
  assert.equal(results.length, 10, "all submissions should resolve");
  const list = await repo.listPredictionsByUser(userId);
  assert.equal(list.length, 1, "only one prediction record should exist");
  assert.equal(list[0].matchId, matchId);
  assert.ok(
    list[0].homeScore >= 0 && list[0].homeScore <= 9,
    "score should be one of the submitted values",
  );
});

test("CT-02: locked after match starts → PREDICTION_LOCKED", async () => {
  const userId = insertUser(db, "ct02-user");
  const matchId = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 1, awayScore: 0 }),
  );
  db.prepare("UPDATE matches SET status = 'live' WHERE id = ?").run(matchId);
  await assert.rejects(
    () =>
      submitPredictionLogic(
        repo,
        userId,
        parsePredictionInput({ matchId, homeScore: 2, awayScore: 2 }),
      ),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as { code?: string }).code, "PREDICTION_LOCKED");
      assert.equal((err as { status?: number }).status, 409);
      return true;
    },
  );
});

test("conditional UPDATE (layer 3) returns null when match no longer scheduled", async () => {
  const userId = insertUser(db, "layer3-user");
  const matchId = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 1, awayScore: 0 }),
  );
  db.prepare("UPDATE matches SET status = 'finished' WHERE id = ?").run(
    matchId,
  );
  const result = await repo.updatePrediction(userId, matchId, 2, 2);
  assert.equal(result, null, "update should be rejected when match is locked");
  const unchanged = await repo.findPrediction(userId, matchId);
  assert.equal(unchanged!.homeScore, 1);
  assert.equal(unchanged!.awayScore, 0);
});

test("CT-03: different users concurrent → all succeed", async () => {
  const userIds = Array.from({ length: 5 }, (_, i) =>
    insertUser(db, `ct03-user-${i}`),
  );
  const matchIds = Array.from({ length: 5 }, () =>
    insertMatch(db, "scheduled"),
  );
  const results = await Promise.all(
    userIds.map((userId, i) =>
      submitPredictionLogic(
        repo,
        userId,
        parsePredictionInput({
          matchId: matchIds[i],
          homeScore: i,
          awayScore: i,
        }),
      ),
    ),
  );
  assert.equal(results.length, 5);
  for (const userId of userIds) {
    const list = await repo.listPredictionsByUser(userId);
    assert.equal(list.length, 1);
  }
});

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  calculatePointsLogic,
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

test("submitPrediction creates new prediction", async () => {
  const userId = insertUser(db, "creator");
  const matchId = insertMatch(db, "scheduled");
  const input = parsePredictionInput({
    matchId,
    homeScore: 2,
    awayScore: 1,
  });
  const prediction = await submitPredictionLogic(repo, userId, input);
  assert.equal(prediction.userId, userId);
  assert.equal(prediction.matchId, matchId);
  assert.equal(prediction.homeScore, 2);
  assert.equal(prediction.awayScore, 1);
  assert.equal(prediction.points, null);
  const found = await repo.findPrediction(userId, matchId);
  assert.ok(found, "prediction should be persisted");
  assert.equal(found!.homeScore, 2);
  assert.equal(found!.awayScore, 1);
});

test("submitPrediction updates existing prediction", async () => {
  const userId = insertUser(db, "updater");
  const matchId = insertMatch(db, "scheduled");
  const first = await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 2, awayScore: 1 }),
  );
  const second = await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 3, awayScore: 0 }),
  );
  assert.equal(second.id, first.id);
  assert.equal(second.homeScore, 3);
  assert.equal(second.awayScore, 0);
  const list = await repo.listPredictionsByUser(userId);
  assert.equal(list.length, 1);
  assert.equal(list[0].homeScore, 3);
  assert.equal(list[0].awayScore, 0);
});

test("submitPrediction rejects when match is finished", async () => {
  const userId = insertUser(db, "latecomer");
  const matchId = insertMatch(db, "finished", 1, 0);
  await assert.rejects(
    () =>
      submitPredictionLogic(
        repo,
        userId,
        parsePredictionInput({ matchId, homeScore: 1, awayScore: 1 }),
      ),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as { code?: string }).code, "PREDICTION_LOCKED");
      assert.equal((err as { status?: number }).status, 409);
      return true;
    },
  );
});

test("listPredictions returns user predictions", async () => {
  const userId = insertUser(db, "lister");
  const match1 = insertMatch(db, "scheduled");
  const match2 = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId: match1, homeScore: 1, awayScore: 0 }),
  );
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId: match2, homeScore: 2, awayScore: 2 }),
  );
  const list = await repo.listPredictionsByUser(userId);
  assert.equal(list.length, 2);
  const byMatch = new Map(list.map((p) => [p.matchId, p]));
  assert.equal(byMatch.get(match1)!.homeScore, 1);
  assert.equal(byMatch.get(match2)!.homeScore, 2);
});

test("getPrediction returns prediction for specific match", async () => {
  const userId = insertUser(db, "getter");
  const matchId = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 4, awayScore: 3 }),
  );
  const prediction = await repo.findPrediction(userId, matchId);
  assert.ok(prediction, "prediction should be found");
  assert.equal(prediction!.matchId, matchId);
  assert.equal(prediction!.homeScore, 4);
  assert.equal(prediction!.awayScore, 3);
  const missing = await repo.findPrediction(userId, 999999);
  assert.equal(missing, null);
});

test("calculatePointsLogic scores exact=3, direction=1, wrong=0", async () => {
  const exactUser = insertUser(db, "exact-scorer");
  const dirUser = insertUser(db, "dir-scorer");
  const wrongUser = insertUser(db, "wrong-scorer");
  const matchId = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    exactUser,
    parsePredictionInput({ matchId, homeScore: 2, awayScore: 1 }),
  );
  await submitPredictionLogic(
    repo,
    dirUser,
    parsePredictionInput({ matchId, homeScore: 3, awayScore: 0 }),
  );
  await submitPredictionLogic(
    repo,
    wrongUser,
    parsePredictionInput({ matchId, homeScore: 0, awayScore: 1 }),
  );
  db.prepare(
    "UPDATE matches SET status = 'finished', home_score = 2, away_score = 1 WHERE id = ?",
  ).run(matchId);
  const updated = await calculatePointsLogic(repo, matchId);
  assert.equal(updated, 3, "should update 3 predictions");
  const exact = await repo.findPrediction(exactUser, matchId);
  const dir = await repo.findPrediction(dirUser, matchId);
  const wrong = await repo.findPrediction(wrongUser, matchId);
  assert.equal(exact!.points, 3);
  assert.equal(dir!.points, 1);
  assert.equal(wrong!.points, 0);
});

test("calculatePointsLogic is a no-op when match not finished", async () => {
  const userId = insertUser(db, "unfinished-scorer");
  const matchId = insertMatch(db, "scheduled");
  await submitPredictionLogic(
    repo,
    userId,
    parsePredictionInput({ matchId, homeScore: 1, awayScore: 0 }),
  );
  const updated = await calculatePointsLogic(repo, matchId);
  assert.equal(updated, 0);
  const prediction = await repo.findPrediction(userId, matchId);
  assert.equal(prediction!.points, null);
});

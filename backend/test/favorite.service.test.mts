import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  addFavoriteLogic,
  createFavoriteRepo,
  listFavoritesLogic,
  removeFavoriteLogic,
  type FavoriteRepo,
} from "../src/service/favorite-logic.ts";

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
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

function insertTeam(
  db: DatabaseSync,
  name: string,
  code: string,
): number {
  const result = db
    .prepare(
      'INSERT INTO teams (name, code, "group", flag_url) VALUES (?, ?, ?, ?)',
    )
    .run(name, code, "A", null);
  return Number(result.lastInsertRowid);
}

function insertMatch(
  db: DatabaseSync,
  homeTeamId: number,
  awayTeamId: number,
): number {
  const result = db
    .prepare(
      `INSERT INTO matches (home_team_id, away_team_id, stage, "group", kickoff_time, status)
       VALUES (?, ?, 'group', 'A', '2026-06-11T13:00:00.000Z', 'scheduled')`,
    )
    .run(homeTeamId, awayTeamId);
  return Number(result.lastInsertRowid);
}

let db: DatabaseSync;
let repo: FavoriteRepo;

before(() => {
  db = new DatabaseSync(":memory:");
  createTables(db);
  repo = createFavoriteRepo(db);
});

after(() => {
  db?.close();
});

test("addFavorite creates a favorite", async () => {
  const userId = insertUser(db, "favoriter");
  const home = insertTeam(db, "Home", "HOM");
  const away = insertTeam(db, "Away", "AWY");
  const matchId = insertMatch(db, home, away);
  const favorite = await addFavoriteLogic(repo, userId, matchId);
  assert.equal(favorite.userId, userId);
  assert.equal(favorite.matchId, matchId);
  assert.ok(favorite.match, "favorite should include match relation");
  assert.equal(favorite.match!.homeTeam!.name, "Home");
  assert.equal(favorite.match!.awayTeam!.name, "Away");
});

test("addFavorite is idempotent (UNIQUE catch, returns existing)", async () => {
  const userId = insertUser(db, "idempotent");
  const home = insertTeam(db, "Home2", "HO2");
  const away = insertTeam(db, "Away2", "AW2");
  const matchId = insertMatch(db, home, away);
  const first = await addFavoriteLogic(repo, userId, matchId);
  const second = await addFavoriteLogic(repo, userId, matchId);
  assert.equal(second.id, first.id);
  assert.equal(second.userId, userId);
  assert.equal(second.matchId, matchId);
  const list = await listFavoritesLogic(repo, userId);
  assert.equal(list.length, 1);
});

test("listFavorites returns user favorites", async () => {
  const userId = insertUser(db, "lister");
  const home = insertTeam(db, "Home3", "HO3");
  const away = insertTeam(db, "Away3", "AW3");
  const match1 = insertMatch(db, home, away);
  const match2 = insertMatch(db, home, away);
  await addFavoriteLogic(repo, userId, match1);
  await addFavoriteLogic(repo, userId, match2);
  const list = await listFavoritesLogic(repo, userId);
  assert.equal(list.length, 2);
  const byMatch = new Map(list.map((f) => [f.matchId, f]));
  assert.ok(byMatch.has(match1));
  assert.ok(byMatch.has(match2));
});

test("removeFavorite deletes the favorite", async () => {
  const userId = insertUser(db, "remover");
  const home = insertTeam(db, "Home4", "HO4");
  const away = insertTeam(db, "Away4", "AW4");
  const matchId = insertMatch(db, home, away);
  await addFavoriteLogic(repo, userId, matchId);
  await removeFavoriteLogic(repo, userId, matchId);
  const list = await listFavoritesLogic(repo, userId);
  assert.equal(list.length, 0);
});

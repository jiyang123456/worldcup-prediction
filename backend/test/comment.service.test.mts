import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createCommentLogic,
  createCommentRepo,
  listCommentsLogic,
  type CommentRepo,
} from "../src/service/comment-logic.ts";
import { parseCommentInput } from "../src/dto/comment.dto.ts";

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
    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

function insertMatch(db: DatabaseSync): number {
  const result = db
    .prepare(
      `INSERT INTO matches (home_team_id, away_team_id, stage, "group", kickoff_time, status)
       VALUES (1, 2, 'group', 'A', '2026-06-11T13:00:00.000Z', 'scheduled')`,
    )
    .run();
  return Number(result.lastInsertRowid);
}

let db: DatabaseSync;
let repo: CommentRepo;

before(() => {
  db = new DatabaseSync(":memory:");
  createTables(db);
  repo = createCommentRepo(db);
});

after(() => {
  db?.close();
});

test("createComment creates a comment", async () => {
  const userId = insertUser(db, "commenter");
  const matchId = insertMatch(db);
  const input = parseCommentInput({ matchId, content: "  Hello world  " });
  const comment = await createCommentLogic(repo, userId, input);
  assert.equal(comment.userId, userId);
  assert.equal(comment.matchId, matchId);
  assert.equal(comment.content, "Hello world");
  assert.ok(comment.user, "comment should include user relation");
  assert.equal(comment.user!.username, "commenter");
});

test("listComments returns comments for a match", async () => {
  const firstUser = insertUser(db, "lister1");
  const secondUser = insertUser(db, "lister2");
  const matchId = insertMatch(db);
  await createCommentLogic(
    repo,
    firstUser,
    parseCommentInput({ matchId, content: "first" }),
  );
  await createCommentLogic(
    repo,
    secondUser,
    parseCommentInput({ matchId, content: "second" }),
  );
  const comments = await listCommentsLogic(repo, matchId);
  assert.equal(comments.length, 2);
  assert.equal(comments[0].content, "second");
  assert.equal(comments[1].content, "first");
  assert.equal(comments[0].user!.username, "lister2");
  assert.equal(comments[1].user!.username, "lister1");
});

test("listComments returns empty for match with no comments", async () => {
  const matchId = insertMatch(db);
  const comments = await listCommentsLogic(repo, matchId);
  assert.equal(comments.length, 0);
});

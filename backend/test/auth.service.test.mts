import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  findUserById,
  loginUser,
  registerUser,
  verifyToken,
  type AuthDeps,
  type UserRepo,
  type UserRow,
} from "../src/service/auth-logic.ts";
import {
  parseLoginInput,
  parseRegisterInput,
} from "../src/dto/auth.dto.ts";
import { hashPassword, verifyPassword } from "../src/util/password.ts";
import { signJwt, verifyJwt } from "../src/util/jwt.ts";
import {
  invalidCredentialsError,
  usernameTakenError,
} from "../src/util/error.ts";

const JWT_SECRET = "test-secret-for-auth-service-tests";

const deps: AuthDeps = {
  signJwt,
  verifyJwt,
  hashPassword,
  verifyPassword,
  duplicateUsernameError: usernameTakenError,
  invalidCredentialsError: invalidCredentialsError,
};

function createTestRepo(db: DatabaseSync): UserRepo {
  return {
    async findByUsername(username: string): Promise<UserRow | null> {
      const stmt = db.prepare(
        "SELECT id, username, password_hash, role FROM users WHERE username = ?",
      );
      const row = stmt.get(username) as UserRow | undefined;
      return row ?? null;
    },
    async insert(
      username: string,
      passwordHash: string,
      role: string,
    ): Promise<UserRow> {
      const stmt = db.prepare(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      );
      const result = stmt.run(username, passwordHash, role);
      const id = Number(result.lastInsertRowid);
      return { id, username, password_hash: passwordHash, role };
    },
    async findById(id: number): Promise<UserRow | null> {
      const stmt = db.prepare(
        "SELECT id, username, password_hash, role FROM users WHERE id = ?",
      );
      const row = stmt.get(id) as UserRow | undefined;
      return row ?? null;
    },
  };
}

function createUsersTable(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

let db: DatabaseSync;
let repo: UserRepo;

before(() => {
  db = new DatabaseSync(":memory:");
  createUsersTable(db);
  repo = createTestRepo(db);
});

after(() => {
  db?.close();
});

test("register creates a user with role 'user'", async () => {
  const input = parseRegisterInput({
    username: "alice",
    password: "password123",
  });
  const result = await registerUser(deps, repo, JWT_SECRET, input);
  assert.equal(result.user.username, "alice");
  assert.equal(result.user.role, "user");
  assert.ok(result.token, "token should be returned");
  const payload = verifyJwt(result.token, JWT_SECRET);
  assert.ok(payload, "token should verify");
  assert.equal(payload?.userId, result.user.id);
  assert.equal(payload?.role, "user");
});

test("register rejects duplicate username (USERNAME_TAKEN)", async () => {
  const input = parseRegisterInput({
    username: "bob",
    password: "password123",
  });
  await registerUser(deps, repo, JWT_SECRET, input);
  await assert.rejects(
    () => registerUser(deps, repo, JWT_SECRET, input),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as { status?: number }).status, 409);
      assert.equal(
        (err as { code?: string }).code,
        "USERNAME_TAKEN",
      );
      return true;
    },
  );
});

test("login with correct credentials returns token", async () => {
  const input = parseRegisterInput({
    username: "carol",
    password: "secret456",
  });
  await registerUser(deps, repo, JWT_SECRET, input);
  const loginInput = parseLoginInput({
    username: "carol",
    password: "secret456",
  });
  const result = await loginUser(deps, repo, JWT_SECRET, loginInput);
  assert.equal(result.user.username, "carol");
  assert.ok(result.token);
  const payload = verifyJwt(result.token, JWT_SECRET);
  assert.equal(payload?.userId, result.user.id);
});

test("login with wrong password fails (INVALID_CREDENTIALS)", async () => {
  const input = parseRegisterInput({
    username: "dave",
    password: "correct789",
  });
  await registerUser(deps, repo, JWT_SECRET, input);
  const loginInput = parseLoginInput({
    username: "dave",
    password: "wrong-password",
  });
  await assert.rejects(
    () => loginUser(deps, repo, JWT_SECRET, loginInput),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as { status?: number }).status, 401);
      assert.equal(
        (err as { code?: string }).code,
        "INVALID_CREDENTIALS",
      );
      return true;
    },
  );
});

test("login with unknown username fails (INVALID_CREDENTIALS)", async () => {
  const loginInput = parseLoginInput({
    username: "nobody",
    password: "whatever12",
  });
  await assert.rejects(
    () => loginUser(deps, repo, JWT_SECRET, loginInput),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as { status?: number }).status, 401);
      return true;
    },
  );
});

test("verifyToken returns payload for valid token", () => {
  const token = signJwt({ userId: 42, role: "admin" }, JWT_SECRET);
  const payload = verifyToken(deps, token, JWT_SECRET);
  assert.equal(payload?.userId, 42);
  assert.equal(payload?.role, "admin");
});

test("verifyToken returns null for invalid token", () => {
  assert.equal(verifyToken(deps, "not.a.jwt", JWT_SECRET), null);
  assert.equal(verifyToken(deps, "tampered", JWT_SECRET), null);
  assert.equal(verifyToken(deps, "", JWT_SECRET), null);
});

test("verifyToken returns null for wrong secret", () => {
  const token = signJwt({ userId: 1, role: "user" }, JWT_SECRET);
  assert.equal(verifyToken(deps, token, "different-secret"), null);
});

test("findUserById returns user when exists", async () => {
  const input = parseRegisterInput({
    username: "eve",
    password: "password123",
  });
  const result = await registerUser(deps, repo, JWT_SECRET, input);
  const found = await findUserById(repo, result.user.id);
  assert.equal(found?.username, "eve");
  assert.equal(found?.role, "user");
});

test("findUserById returns null when not found", async () => {
  const found = await findUserById(repo, 999999);
  assert.equal(found, null);
});

test("hashPassword and verifyPassword round-trip", () => {
  const password = "my-secret-password";
  const hash = hashPassword(password);
  assert.ok(verifyPassword(password, hash));
  assert.ok(!verifyPassword("wrong", hash));
});

test("hashPassword produces different hashes for same password", () => {
  const password = "same-password";
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);
  assert.notEqual(hash1, hash2);
  assert.ok(verifyPassword(password, hash1));
  assert.ok(verifyPassword(password, hash2));
});

test("parseRegisterInput trims username and validates lengths", () => {
  const input = parseRegisterInput({
    username: "  user1  ",
    password: "password123",
  });
  assert.equal(input.username, "user1");
  assert.equal(input.password, "password123");
});

test("parseRegisterInput rejects short username", () => {
  assert.throws(
    () => parseRegisterInput({ username: "a", password: "password123" }),
    TypeError,
  );
});

test("parseRegisterInput rejects short password", () => {
  assert.throws(
    () => parseRegisterInput({ username: "validuser", password: "12345" }),
    TypeError,
  );
});

test("parseRegisterInput rejects non-object body", () => {
  assert.throws(() => parseRegisterInput(null), TypeError);
  assert.throws(() => parseRegisterInput("string"), TypeError);
  assert.throws(() => parseRegisterInput(undefined), TypeError);
});

test("parseLoginInput rejects empty username or password", () => {
  assert.throws(
    () => parseLoginInput({ username: "", password: "password123" }),
    TypeError,
  );
  assert.throws(
    () => parseLoginInput({ username: "alice", password: "" }),
    TypeError,
  );
});

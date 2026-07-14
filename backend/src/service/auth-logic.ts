import type { JwtPayload } from "../util/jwt";
import type {
  AuthResult,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../dto/auth.dto";

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: string;
}

export interface UserRepo {
  findByUsername(username: string): Promise<UserRow | null>;
  insert(username: string, passwordHash: string, role: string): Promise<UserRow>;
  findById(id: number): Promise<UserRow | null>;
}

export interface AuthDeps {
  signJwt: (
    payload: { userId: number; role: string },
    secret: string,
  ) => string;
  verifyJwt: (token: string, secret: string) => JwtPayload | null;
  hashPassword: (password: string) => string;
  verifyPassword: (password: string, stored: string) => boolean;
  duplicateUsernameError: () => Error;
  invalidCredentialsError: () => Error;
}

function toAuthUser(row: UserRow): AuthUser {
  return { id: row.id, username: row.username, role: row.role };
}

export async function registerUser(
  deps: AuthDeps,
  repo: UserRepo,
  jwtSecret: string,
  input: RegisterInput,
): Promise<AuthResult> {
  const existing = await repo.findByUsername(input.username);
  if (existing) {
    throw deps.duplicateUsernameError();
  }
  const passwordHash = deps.hashPassword(input.password);
  const row = await repo.insert(input.username, passwordHash, "user");
  const token = deps.signJwt({ userId: row.id, role: row.role }, jwtSecret);
  return { token, user: toAuthUser(row) };
}

export async function loginUser(
  deps: AuthDeps,
  repo: UserRepo,
  jwtSecret: string,
  input: LoginInput,
): Promise<AuthResult> {
  const row = await repo.findByUsername(input.username);
  if (!row) {
    throw deps.invalidCredentialsError();
  }
  if (!deps.verifyPassword(input.password, row.password_hash)) {
    throw deps.invalidCredentialsError();
  }
  const token = deps.signJwt({ userId: row.id, role: row.role }, jwtSecret);
  return { token, user: toAuthUser(row) };
}

export function verifyToken(
  deps: AuthDeps,
  token: string,
  jwtSecret: string,
): JwtPayload | null {
  return deps.verifyJwt(token, jwtSecret);
}

export async function findUserById(
  repo: UserRepo,
  id: number,
): Promise<AuthUser | null> {
  const row = await repo.findById(id);
  return row ? toAuthUser(row) : null;
}

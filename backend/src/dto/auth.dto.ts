export interface RegisterInput {
  username: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export interface ContextUser {
  id: number;
  role: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

const USERNAME_MIN = 2;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUsername(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePassword(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseRegisterInput(value: unknown): RegisterInput {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }
  const username = parseUsername(value.username);
  const password = parsePassword(value.password);

  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    throw new TypeError(
      `用户名长度必须在 ${USERNAME_MIN} 到 ${USERNAME_MAX} 个字符之间`,
    );
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    throw new TypeError(
      `密码长度必须在 ${PASSWORD_MIN} 到 ${PASSWORD_MAX} 个字符之间`,
    );
  }
  return { username, password };
}

export function parseLoginInput(value: unknown): LoginInput {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }
  const username = parseUsername(value.username);
  const password = parsePassword(value.password);

  if (username.length === 0) {
    throw new TypeError("用户名不能为空");
  }
  if (password.length === 0) {
    throw new TypeError("密码不能为空");
  }
  return { username, password };
}

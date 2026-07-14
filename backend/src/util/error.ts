import { MidwayHttpError } from "@midwayjs/core";

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  PREDICTION_LOCKED: "PREDICTION_LOCKED",
  DUPLICATE_PREDICTION: "DUPLICATE_PREDICTION",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
} as const;

export type ErrorCodes = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function createError(
  code: ErrorCodes,
  message: string,
  status: number,
): MidwayHttpError {
  return new MidwayHttpError({ message }, status, code);
}

export function unauthorizedError(): MidwayHttpError {
  return createError(ErrorCodes.UNAUTHORIZED, "未认证或令牌无效", 401);
}

export function forbiddenError(): MidwayHttpError {
  return createError(ErrorCodes.FORBIDDEN, "无权限访问该资源", 403);
}

export function notFoundError(): MidwayHttpError {
  return createError(ErrorCodes.NOT_FOUND, "资源不存在", 404);
}

export function usernameTakenError(): MidwayHttpError {
  return createError(ErrorCodes.USERNAME_TAKEN, "用户名已被占用", 409);
}

export function invalidCredentialsError(): MidwayHttpError {
  return createError(ErrorCodes.INVALID_CREDENTIALS, "用户名或密码错误", 401);
}

export function validationError(message: string): MidwayHttpError {
  return createError(ErrorCodes.VALIDATION_ERROR, message, 400);
}

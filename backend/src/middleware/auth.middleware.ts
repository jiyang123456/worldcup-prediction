import { Inject, Middleware } from "@midwayjs/core";
import type { Middleware as KoaMiddleware } from "koa";
import { AuthService } from "../service/auth.service";
import { unauthorizedError } from "../util/error";
import type { ContextUser } from "../dto/auth.dto";

@Middleware()
export class AuthMiddleware {
  @Inject()
  authService: AuthService;

  resolve(): KoaMiddleware {
    return async (ctx, next) => {
      const authHeader = ctx.headers.authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        throw unauthorizedError();
      }
      const token = authHeader.slice("Bearer ".length).trim();
      if (!token) {
        throw unauthorizedError();
      }
      const payload = this.authService.verifyToken(token);
      if (!payload) {
        throw unauthorizedError();
      }
      (ctx as unknown as { user: ContextUser }).user = {
        id: payload.userId,
        role: payload.role,
      };
      await next();
    };
  }

  static getName(): string {
    return "auth";
  }
}

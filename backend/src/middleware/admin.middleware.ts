import { Middleware } from "@midwayjs/core";
import type { Middleware as KoaMiddleware } from "koa";
import { forbiddenError } from "../util/error";
import type { ContextUser } from "../dto/auth.dto";

@Middleware()
export class AdminMiddleware {
  resolve(): KoaMiddleware {
    return async (ctx, next) => {
      const user = (ctx as unknown as { user?: ContextUser }).user;
      if (!user || user.role !== "admin") {
        throw forbiddenError();
      }
      await next();
    };
  }

  static getName(): string {
    return "admin";
  }
}

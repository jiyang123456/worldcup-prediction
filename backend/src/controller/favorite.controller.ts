import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  createRequestParamDecorator,
} from "@midwayjs/core";
import { FavoriteService } from "../service/favorite.service";
import { AuthMiddleware } from "../middleware/auth.middleware";
import type { ContextUser } from "../dto/auth.dto";
import { unauthorizedError, validationError } from "../util/error";

const Ctx = () => createRequestParamDecorator((ctx: unknown) => ctx);

function parseMatchId(value: unknown): number {
  const matchId = Number(value);
  if (!Number.isInteger(matchId) || matchId < 1) {
    throw new TypeError("matchId 必须是正整数");
  }
  return matchId;
}

@Controller("/api/favorites")
export class FavoriteController {
  @Inject()
  favoriteService: FavoriteService;

  @Post("/", { middleware: [AuthMiddleware] })
  async add(
    @Body() body: unknown,
    @Ctx() ctx: { user?: ContextUser },
  ) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    let matchId: number;
    try {
      if (
        typeof body !== "object" ||
        body === null ||
        Array.isArray(body)
      ) {
        throw new TypeError("请求体必须是 JSON 对象");
      }
      matchId = parseMatchId((body as Record<string, unknown>).matchId);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw validationError(message);
    }
    const favorite = await this.favoriteService.addFavorite(user.id, matchId);
    return { data: favorite };
  }

  @Get("/", { middleware: [AuthMiddleware] })
  async list(@Ctx() ctx: { user?: ContextUser }) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    const favorites = await this.favoriteService.listFavorites(user.id);
    return { data: favorites };
  }

  @Del("/:matchId", { middleware: [AuthMiddleware] })
  async remove(
    @Param("matchId") matchId: string,
    @Ctx() ctx: { user?: ContextUser },
  ) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    let matchIdNum: number;
    try {
      matchIdNum = parseMatchId(matchId);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw validationError(message);
    }
    await this.favoriteService.removeFavorite(user.id, matchIdNum);
    return { data: null };
  }
}

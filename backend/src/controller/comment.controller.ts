import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  createRequestParamDecorator,
} from "@midwayjs/core";
import { CommentService } from "../service/comment.service";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { parseCommentInput } from "../dto/comment.dto";
import type { ContextUser } from "../dto/auth.dto";
import { unauthorizedError, validationError } from "../util/error";

const Ctx = () => createRequestParamDecorator((ctx: unknown) => ctx);

@Controller("/api/comments")
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Get("/:matchId")
  async list(@Param("matchId") matchId: string) {
    const comments = await this.commentService.listComments(Number(matchId));
    return { data: comments };
  }

  @Post("/", { middleware: [AuthMiddleware] })
  async create(
    @Body() body: unknown,
    @Ctx() ctx: { user?: ContextUser },
  ) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    let input;
    try {
      input = parseCommentInput(body);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw validationError(message);
    }
    const comment = await this.commentService.createComment(user.id, input);
    return { data: comment };
  }
}

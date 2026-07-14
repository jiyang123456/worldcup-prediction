import {
  Body,
  Controller,
  createRequestParamDecorator,
  Get,
  httpError,
  Inject,
  Post,
} from "@midwayjs/core";
import { AuthService } from "../service/auth.service";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  parseLoginInput,
  parseRegisterInput,
  type ContextUser,
} from "../dto/auth.dto";

const Ctx = () => createRequestParamDecorator((ctx: unknown) => ctx);

@Controller("/api/auth")
export class AuthController {
  @Inject()
  authService: AuthService;

  @Post("/register")
  async register(@Body() body: unknown) {
    let input;
    try {
      input = parseRegisterInput(body);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw new httpError.BadRequestError(message);
    }
    return await this.authService.register(input);
  }

  @Post("/login")
  async login(@Body() body: unknown) {
    let input;
    try {
      input = parseLoginInput(body);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw new httpError.BadRequestError(message);
    }
    return await this.authService.login(input);
  }

  @Get("/me", { middleware: [AuthMiddleware] })
  async me(@Ctx() ctx: { user?: ContextUser }) {
    const user = ctx.user;
    if (!user) {
      throw new httpError.UnauthorizedError("未认证");
    }
    const fullUser = await this.authService.findById(user.id);
    if (!fullUser) {
      throw new httpError.UnauthorizedError("用户不存在");
    }
    return { data: fullUser };
  }
}

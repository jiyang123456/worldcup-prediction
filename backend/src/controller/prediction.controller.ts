import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  createRequestParamDecorator,
} from "@midwayjs/core";
import { PredictionService } from "../service/prediction.service";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { parsePredictionInput } from "../dto/prediction.dto";
import type { ContextUser } from "../dto/auth.dto";
import {
  notFoundError,
  unauthorizedError,
  validationError,
} from "../util/error";

const Ctx = () => createRequestParamDecorator((ctx: unknown) => ctx);

@Controller("/api/predictions")
export class PredictionController {
  @Inject()
  predictionService: PredictionService;

  @Post("/", { middleware: [AuthMiddleware] })
  async submit(@Body() body: unknown, @Ctx() ctx: { user?: ContextUser }) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    let input;
    try {
      input = parsePredictionInput(body);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw validationError(message);
    }
    const prediction = await this.predictionService.submitPrediction(
      user.id,
      input,
    );
    return { data: prediction };
  }

  @Get("/", { middleware: [AuthMiddleware] })
  async list(@Ctx() ctx: { user?: ContextUser }) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    const predictions = await this.predictionService.listPredictions(user.id);
    return { data: predictions };
  }

  @Get("/:matchId", { middleware: [AuthMiddleware] })
  async getPrediction(
    @Param("matchId") matchId: string,
    @Ctx() ctx: { user?: ContextUser },
  ) {
    const user = ctx.user;
    if (!user) {
      throw unauthorizedError();
    }
    const prediction = await this.predictionService.getPrediction(
      user.id,
      Number(matchId),
    );
    if (!prediction) {
      throw notFoundError();
    }
    return { data: prediction };
  }
}

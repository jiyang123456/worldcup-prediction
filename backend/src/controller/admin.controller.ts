import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
} from "@midwayjs/core";
import { MatchService } from "../service/match.service";
import { PredictionService } from "../service/prediction.service";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { AdminMiddleware } from "../middleware/admin.middleware";
import { parseMatchResultInput } from "../dto/match.dto";
import { notFoundError, validationError } from "../util/error";

@Controller("/api/admin", {
  middleware: [AuthMiddleware, AdminMiddleware],
})
export class AdminController {
  @Inject()
  matchService: MatchService;

  @Inject()
  predictionService: PredictionService;

  @Patch("/matches/:id/result")
  async updateMatchResult(
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    let input;
    try {
      input = parseMatchResultInput(body);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "请求参数不合法";
      throw validationError(message);
    }
    const match = await this.matchService.updateMatchResult(
      Number(id),
      input.homeScore,
      input.awayScore,
    );
    if (!match) {
      throw notFoundError();
    }
    await this.predictionService.calculatePoints(match.id);
    return { data: match };
  }
}

import { Controller, Get, Inject, Param, Query } from "@midwayjs/core";
import { MatchService } from "../service/match.service";
import { ErrorCodes, createError } from "../util/error";

@Controller("/api")
export class MatchController {
  @Inject()
  matchService: MatchService;

  @Get("/matches")
  async listMatches(
    @Query("stage") stage?: string,
    @Query("status") status?: string,
  ) {
    const matches = await this.matchService.listMatches(stage, status);
    return { data: matches };
  }

  @Get("/matches/:id")
  async getMatch(@Param("id") id: string) {
    const match = await this.matchService.getMatch(Number(id));
    if (!match) {
      throw createError(ErrorCodes.NOT_FOUND, "比赛不存在", 404);
    }
    return { data: match };
  }

  @Get("/standings")
  async getStandings(@Query("group") group?: string) {
    const standings = await this.matchService.getStandings(group);
    return { data: standings };
  }

  @Get("/knockout")
  async getKnockout() {
    const bracket = await this.matchService.getKnockout();
    return { data: bracket };
  }

  @Get("/teams")
  async listTeams() {
    const teams = await this.matchService.listTeams();
    return { data: teams };
  }

  @Get("/teams/:id")
  async getTeam(@Param("id") id: string) {
    const team = await this.matchService.getTeam(Number(id));
    if (!team) {
      throw createError(ErrorCodes.NOT_FOUND, "球队不存在", 404);
    }
    return { data: team };
  }
}

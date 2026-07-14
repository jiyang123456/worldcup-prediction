import { Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource, type FindOptionsWhere } from "typeorm";
import { Match } from "../entity/match.entity";
import { Team } from "../entity/team.entity";
import * as matchLogic from "./match-logic";
import type { MatchData, MatchRepo, TeamData } from "./match-logic";

@Provide()
export class MatchService {
  @InjectDataSource()
  dataSource: DataSource;

  private createRepo(): MatchRepo {
    const matchRepo = this.dataSource.getRepository(Match);
    const teamRepo = this.dataSource.getRepository(Team);
    return {
      async findMatches(stage?: string, status?: string): Promise<MatchData[]> {
        const where: FindOptionsWhere<Match> = {};
        if (stage) {
          where.stage = stage as Match["stage"];
        }
        if (status) {
          where.status = status as Match["status"];
        }
        const matches = await matchRepo.find({
          where,
          order: { kickoffTime: "ASC" },
        });
        return matches as unknown as MatchData[];
      },
      async findMatchById(id: number): Promise<MatchData | null> {
        const match = await matchRepo.findOne({ where: { id } });
        return (match ?? null) as unknown as MatchData | null;
      },
      async findFinishedGroupMatches(group?: string): Promise<MatchData[]> {
        const where: FindOptionsWhere<Match> = {
          stage: "group",
          status: "finished",
        };
        if (group) {
          where.group = group;
        }
        const matches = await matchRepo.find({ where });
        return matches as unknown as MatchData[];
      },
      async findAllTeams(): Promise<TeamData[]> {
        const teams = await teamRepo.find({ order: { name: "ASC" } });
        return teams as unknown as TeamData[];
      },
      async findTeamById(id: number): Promise<TeamData | null> {
        const team = await teamRepo.findOne({ where: { id } });
        return (team ?? null) as unknown as TeamData | null;
      },
      async updateMatchResult(
        id: number,
        homeScore: number,
        awayScore: number,
      ): Promise<MatchData | null> {
        const match = await matchRepo.findOne({ where: { id } });
        if (!match) {
          return null;
        }
        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.status = "finished";
        const saved = await matchRepo.save(match);
        return saved as unknown as MatchData;
      },
    };
  }

  listMatches(stage?: string, status?: string): Promise<MatchData[]> {
    return matchLogic.listMatches(this.createRepo(), stage, status);
  }

  getMatch(id: number): Promise<MatchData | null> {
    return matchLogic.getMatch(this.createRepo(), id);
  }

  getStandings(group?: string): Promise<matchLogic.Standing[]> {
    return matchLogic.getStandings(this.createRepo(), group);
  }

  getKnockout(): Promise<Record<string, matchLogic.KnockoutMatch[]>> {
    return matchLogic.getKnockout(this.createRepo());
  }

  listTeams(): Promise<TeamData[]> {
    return matchLogic.listTeams(this.createRepo());
  }

  getTeam(id: number): Promise<TeamData | null> {
    return matchLogic.getTeam(this.createRepo(), id);
  }

  updateMatchResult(
    id: number,
    homeScore: number,
    awayScore: number,
  ): Promise<MatchData | null> {
    return matchLogic.updateMatchResult(
      this.createRepo(),
      id,
      homeScore,
      awayScore,
    );
  }
}

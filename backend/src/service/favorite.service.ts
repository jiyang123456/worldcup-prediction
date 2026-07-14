import { Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource, In } from "typeorm";
import { Favorite } from "../entity/favorite.entity";
import { Match } from "../entity/match.entity";
import {
  addFavoriteLogic,
  listFavoritesLogic,
  removeFavoriteLogic,
  type FavoriteData,
  type FavoriteMatchData,
  type FavoriteRepo,
  type FavoriteTeamData,
} from "./favorite-logic";

@Provide()
export class FavoriteService {
  @InjectDataSource()
  dataSource: DataSource;

  private createRepo(): FavoriteRepo {
    const favoriteRepo = this.dataSource.getRepository(Favorite);
    const matchRepo = this.dataSource.getRepository(Match);

    const toTeamData = (
      team: Match["homeTeam"] | null,
    ): FavoriteTeamData | null => {
      if (!team) {
        return null;
      }
      return {
        id: team.id,
        name: team.name,
        code: team.code,
        flagUrl: team.flagUrl,
      };
    };

    const toMatchData = (match: Match | null): FavoriteMatchData | null => {
      if (!match) {
        return null;
      }
      return {
        id: match.id,
        stage: match.stage,
        group: match.group,
        kickoffTime:
          match.kickoffTime instanceof Date
            ? match.kickoffTime.toISOString()
            : String(match.kickoffTime),
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
        homeTeam: toTeamData(match.homeTeam),
        awayTeam: toTeamData(match.awayTeam),
      };
    };

    const toData = (f: Favorite, match: Match | null): FavoriteData => ({
      id: f.id,
      userId: f.userId,
      matchId: f.matchId,
      createdAt:
        f.createdAt instanceof Date
          ? f.createdAt.toISOString()
          : String(f.createdAt),
      match: toMatchData(match),
    });

    return {
      async findFavorite(
        userId: number,
        matchId: number,
      ): Promise<FavoriteData | null> {
        const f = await favoriteRepo.findOne({ where: { userId, matchId } });
        if (!f) {
          return null;
        }
        const match = await matchRepo.findOne({ where: { id: matchId } });
        return toData(f, match ?? null);
      },
      async insertFavorite(
        userId: number,
        matchId: number,
      ): Promise<FavoriteData> {
        const fav = new Favorite();
        fav.userId = userId;
        fav.matchId = matchId;
        const saved = await favoriteRepo.save(fav);
        const match = await matchRepo.findOne({ where: { id: matchId } });
        return toData(saved, match ?? null);
      },
      async listFavorites(userId: number): Promise<FavoriteData[]> {
        const favorites = await favoriteRepo.find({
          where: { userId },
          order: { id: "ASC" },
        });
        if (favorites.length === 0) {
          return [];
        }
        const matchIds = [...new Set(favorites.map((f) => f.matchId))];
        const matches = await matchRepo.find({
          where: { id: In(matchIds) },
        });
        const matchMap = new Map(matches.map((m) => [m.id, m]));
        return favorites.map((f) =>
          toData(f, matchMap.get(f.matchId) ?? null),
        );
      },
      async removeFavorite(
        userId: number,
        matchId: number,
      ): Promise<void> {
        await favoriteRepo.delete({ userId, matchId });
      },
    };
  }

  addFavorite(userId: number, matchId: number): Promise<FavoriteData> {
    return addFavoriteLogic(this.createRepo(), userId, matchId);
  }

  listFavorites(userId: number): Promise<FavoriteData[]> {
    return listFavoritesLogic(this.createRepo(), userId);
  }

  removeFavorite(userId: number, matchId: number): Promise<void> {
    return removeFavoriteLogic(this.createRepo(), userId, matchId);
  }
}

import { Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource } from "typeorm";
import { Prediction } from "../entity/prediction.entity";
import { Match } from "../entity/match.entity";
import {
  calculatePointsLogic,
  scorePrediction,
  submitPredictionLogic,
  type PredictionData,
  type PredictionRepo,
} from "./prediction-logic";
import type { PredictionInput } from "../dto/prediction.dto";
import { predictionLockedError } from "../util/error";

@Provide()
export class PredictionService {
  @InjectDataSource()
  dataSource: DataSource;

  private createRepo(): PredictionRepo {
    const { dataSource } = this;
    const predictionRepo = dataSource.getRepository(Prediction);
    const matchRepo = dataSource.getRepository(Match);

    const toData = (p: Prediction): PredictionData => ({
      id: p.id,
      userId: p.userId,
      matchId: p.matchId,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      points: p.points,
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : String(p.createdAt),
    });

    return {
      async findPrediction(
        userId: number,
        matchId: number,
      ): Promise<PredictionData | null> {
        const p = await predictionRepo.findOne({
          where: { userId, matchId },
        });
        return p ? toData(p) : null;
      },
      async insertPrediction(
        userId: number,
        matchId: number,
        homeScore: number,
        awayScore: number,
      ): Promise<PredictionData> {
        const p = new Prediction();
        p.userId = userId;
        p.matchId = matchId;
        p.homeScore = homeScore;
        p.awayScore = awayScore;
        p.points = null;
        const saved = await predictionRepo.save(p);
        return toData(saved);
      },
      async updatePrediction(
        userId: number,
        matchId: number,
        homeScore: number,
        awayScore: number,
      ): Promise<PredictionData | null> {
        const result = await dataSource
          .createQueryBuilder()
          .update(Prediction)
          .set({ homeScore, awayScore })
          .where("user_id = :userId", { userId })
          .andWhere("match_id = :mId", { mId: matchId })
          .andWhere(
            "(SELECT status FROM matches WHERE id = :mId2) = 'scheduled'",
            { mId2: matchId },
          )
          .execute();
        if (!result.affected || result.affected === 0) {
          return null;
        }
        const p = await predictionRepo.findOne({
          where: { userId, matchId },
        });
        return p ? toData(p) : null;
      },
      async findMatchStatus(matchId: number): Promise<string | null> {
        const m = await matchRepo.findOne({ where: { id: matchId } });
        return m ? m.status : null;
      },
      async listPredictionsByUser(userId: number): Promise<PredictionData[]> {
        const predictions = await predictionRepo.find({
          where: { userId },
          order: { id: "ASC" },
        });
        return predictions.map(toData);
      },
      async calculatePointsForMatch(matchId: number): Promise<number> {
        const match = await matchRepo.findOne({ where: { id: matchId } });
        if (!match || match.homeScore === null || match.awayScore === null) {
          return 0;
        }
        const predictions = await predictionRepo.find({
          where: { matchId },
        });
        let count = 0;
        for (const pred of predictions) {
          pred.points = scorePrediction(
            pred.homeScore,
            pred.awayScore,
            match.homeScore,
            match.awayScore,
          );
          await predictionRepo.save(pred);
          count += 1;
        }
        return count;
      },
    };
  }

  async submitPrediction(
    userId: number,
    input: PredictionInput,
  ): Promise<PredictionData> {
    try {
      return await submitPredictionLogic(this.createRepo(), userId, input);
    } catch (err) {
      if (
        err instanceof Error &&
        (err as { code?: string }).code === "PREDICTION_LOCKED"
      ) {
        throw predictionLockedError();
      }
      throw err;
    }
  }

  listPredictions(userId: number): Promise<PredictionData[]> {
    return this.createRepo().listPredictionsByUser(userId);
  }

  getPrediction(
    userId: number,
    matchId: number,
  ): Promise<PredictionData | null> {
    return this.createRepo().findPrediction(userId, matchId);
  }

  calculatePoints(matchId: number): Promise<number> {
    return calculatePointsLogic(this.createRepo(), matchId);
  }
}

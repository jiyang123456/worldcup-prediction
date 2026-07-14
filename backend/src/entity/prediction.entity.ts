import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("predictions")
@Unique("UQ_predictions_user_match", ["userId", "matchId"])
export class Prediction {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "user_id", type: "integer" })
  userId: number;

  @Column({ name: "match_id", type: "integer" })
  matchId: number;

  @Column({ name: "home_score", type: "integer" })
  homeScore: number;

  @Column({ name: "away_score", type: "integer" })
  awayScore: number;

  @Column({ name: "points", type: "integer", nullable: true })
  points: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

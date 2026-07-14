import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Team } from "./team.entity";

@Entity("matches")
export class Match {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: "home_team_id" })
  homeTeam: Team;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: "away_team_id" })
  awayTeam: Team;

  @Column({ name: "stage", type: "text" })
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";

  @Column({ name: "group", type: "text", nullable: true })
  group: string | null;

  @Column({ name: "kickoff_time", type: "datetime" })
  kickoffTime: Date;

  @Column({ name: "home_score", type: "integer", nullable: true })
  homeScore: number | null;

  @Column({ name: "away_score", type: "integer", nullable: true })
  awayScore: number | null;

  @Column({ name: "status", type: "text", default: "scheduled" })
  status: "scheduled" | "live" | "finished";

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

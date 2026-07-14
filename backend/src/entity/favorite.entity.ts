import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("favorites")
@Unique("UQ_favorites_user_match", ["userId", "matchId"])
export class Favorite {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "user_id", type: "integer" })
  userId: number;

  @Column({ name: "match_id", type: "integer" })
  matchId: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

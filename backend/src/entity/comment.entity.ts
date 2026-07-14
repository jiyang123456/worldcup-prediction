import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "user_id", type: "integer" })
  userId: number;

  @Index("IDX_comments_match_id")
  @Column({ name: "match_id", type: "integer" })
  matchId: number;

  @Column({ name: "content", type: "text" })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

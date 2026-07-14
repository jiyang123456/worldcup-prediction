import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("teams")
export class Team {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "name", type: "text" })
  name: string;

  @Column({ name: "code", type: "text" })
  code: string;

  @Column({ name: "group", type: "text", nullable: true })
  group: string | null;

  @Column({ name: "flag_url", type: "text", nullable: true })
  flagUrl: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

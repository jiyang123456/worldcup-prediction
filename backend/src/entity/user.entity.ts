import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "username", type: "text", unique: true })
  username: string;

  @Column({ name: "password_hash", type: "text" })
  passwordHash: string;

  @Column({ name: "role", type: "text", default: "user" })
  role: "user" | "admin";

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

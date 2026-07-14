import { Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource, In } from "typeorm";
import { Comment } from "../entity/comment.entity";
import { User } from "../entity/user.entity";
import {
  createCommentLogic,
  listCommentsLogic,
  type CommentData,
  type CommentRepo,
  type CommentUserData,
} from "./comment-logic";
import type { CommentInput } from "../dto/comment.dto";

@Provide()
export class CommentService {
  @InjectDataSource()
  dataSource: DataSource;

  private createRepo(): CommentRepo {
    const commentRepo = this.dataSource.getRepository(Comment);
    const userRepo = this.dataSource.getRepository(User);

    const toData = (c: Comment, user?: User | null): CommentData => {
      const userData: CommentUserData | null = user
        ? { id: user.id, username: user.username }
        : null;
      return {
        id: c.id,
        userId: c.userId,
        matchId: c.matchId,
        content: c.content,
        createdAt:
          c.createdAt instanceof Date
            ? c.createdAt.toISOString()
            : String(c.createdAt),
        user: userData,
      };
    };

    return {
      async listComments(matchId: number): Promise<CommentData[]> {
        const comments = await commentRepo.find({
          where: { matchId },
          order: { createdAt: "DESC", id: "DESC" },
        });
        if (comments.length === 0) {
          return [];
        }
        const userIds = [...new Set(comments.map((c) => c.userId))];
        const users = await userRepo.find({
          where: { id: In(userIds) },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        return comments.map((c) =>
          toData(c, userMap.get(c.userId) ?? null),
        );
      },
      async insertComment(
        userId: number,
        matchId: number,
        content: string,
      ): Promise<CommentData> {
        const comment = new Comment();
        comment.userId = userId;
        comment.matchId = matchId;
        comment.content = content;
        const saved = await commentRepo.save(comment);
        const user = await userRepo.findOne({ where: { id: userId } });
        return toData(saved, user ?? null);
      },
    };
  }

  listComments(matchId: number): Promise<CommentData[]> {
    return listCommentsLogic(this.createRepo(), matchId);
  }

  createComment(userId: number, input: CommentInput): Promise<CommentData> {
    return createCommentLogic(this.createRepo(), userId, input);
  }
}

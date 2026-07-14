import type { DatabaseSync } from "node:sqlite";
import type { CommentInput } from "../dto/comment.dto";

export interface CommentUserData {
  id: number;
  username: string;
}

export interface CommentData {
  id: number;
  userId: number;
  matchId: number;
  content: string;
  createdAt: string;
  user: CommentUserData | null;
}

export interface CommentRepo {
  listComments(matchId: number): Promise<CommentData[]>;
  insertComment(
    userId: number,
    matchId: number,
    content: string,
  ): Promise<CommentData>;
}

interface CommentRow {
  id: number;
  user_id: number;
  match_id: number;
  content: string;
  created_at: string;
  u_id: number | null;
  u_username: string | null;
}

const COMMENT_SELECT = `
  SELECT c.id, c.user_id, c.match_id, c.content, c.created_at,
         u.id AS u_id, u.username AS u_username
  FROM comments c
  LEFT JOIN users u ON u.id = c.user_id
`;

function mapRow(row: CommentRow): CommentData {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    content: row.content,
    createdAt: row.created_at,
    user:
      row.u_id != null
        ? { id: row.u_id, username: row.u_username ?? "" }
        : null,
  };
}

export function createCommentRepo(db: DatabaseSync): CommentRepo {
  const fetchById = (id: number): CommentData | null => {
    const row = db.prepare(`${COMMENT_SELECT} WHERE c.id = ?`).get(id) as
      | CommentRow
      | undefined;
    return row ? mapRow(row) : null;
  };

  return {
    async listComments(matchId: number): Promise<CommentData[]> {
      const rows = db
        .prepare(
          `${COMMENT_SELECT} WHERE c.match_id = ? ORDER BY c.created_at DESC, c.id DESC`,
        )
        .all(matchId) as unknown as CommentRow[];
      return rows.map(mapRow);
    },
    async insertComment(
      userId: number,
      matchId: number,
      content: string,
    ): Promise<CommentData> {
      const result = db
        .prepare(
          "INSERT INTO comments (user_id, match_id, content) VALUES (?, ?, ?)",
        )
        .run(userId, matchId, content);
      return fetchById(Number(result.lastInsertRowid))!;
    },
  };
}

export async function listCommentsLogic(
  repo: CommentRepo,
  matchId: number,
): Promise<CommentData[]> {
  return repo.listComments(matchId);
}

export async function createCommentLogic(
  repo: CommentRepo,
  userId: number,
  input: CommentInput,
): Promise<CommentData> {
  return repo.insertComment(userId, input.matchId, input.content);
}

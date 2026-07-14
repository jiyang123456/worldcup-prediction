export interface CommentInput {
  matchId: number;
  content: string;
}

const CONTENT_MIN = 1;
const CONTENT_MAX = 500;

export function parseCommentInput(value: unknown): CommentInput {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new TypeError("请求体必须是 JSON 对象");
  }
  const v = value as Record<string, unknown>;
  const matchId = Number(v.matchId);
  if (!Number.isInteger(matchId) || matchId < 1) {
    throw new TypeError("matchId 必须是正整数");
  }
  const content = typeof v.content === "string" ? v.content.trim() : "";
  if (content.length < CONTENT_MIN || content.length > CONTENT_MAX) {
    throw new TypeError(
      `content 长度必须在 ${CONTENT_MIN} 到 ${CONTENT_MAX} 个字符之间`,
    );
  }
  return { matchId, content };
}

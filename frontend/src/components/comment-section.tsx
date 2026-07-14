"use client";

import type { Comment } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function CommentSection({
  matchId,
  initialComments,
}: {
  matchId: number;
  initialComments: Comment[];
}) {
  return (
    <section
      data-match-id={matchId}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="mb-4 text-lg font-bold text-slate-950">比赛讨论</h2>
      {initialComments.length === 0 ? (
        <p className="text-sm text-slate-500">还没有评论，快来抢沙发。</p>
      ) : (
        <ul className="space-y-3">
          {initialComments.map((comment) => (
            <li key={comment.id} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {comment.user.username}
                </span>
                <time>{formatDateTime(comment.createdAt)}</time>
              </div>
              <p className="text-sm text-slate-800">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-400">评论功能完善中...</p>
    </section>
  );
}

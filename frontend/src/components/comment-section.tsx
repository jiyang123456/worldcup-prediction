"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StateHandler, type StateStatus } from "@/components/state-handler";
import { formatDateTime } from "@/lib/format";
import type { Comment } from "@/lib/types";

export function CommentSection({
  matchId,
  initialComments,
}: {
  matchId: number;
  initialComments: Comment[];
}) {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const listStatus: StateStatus = comments.length === 0 ? "empty" : "success";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 500) {
      setSubmitError("评论内容需为 1-500 字符");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post<{ data: Comment }>("/api/comments", {
        matchId,
        content: trimmed,
      });
      setComments((prev) => [res.data, ...prev]);
      setContent("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "发表评论失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      data-match-id={matchId}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="mb-4 text-lg font-bold text-slate-950">比赛讨论</h2>
      <StateHandler status={listStatus} empty="暂无评论，快来抢沙发。">
        <ul className="space-y-3">
          {comments.map((comment) => (
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
      </StateHandler>

      <div className="mt-6 border-t border-slate-200 pt-4">
        {authLoading ? null : !user ? (
          <p className="text-sm text-slate-600">
            请先登录后参与讨论，前往{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              登录
            </Link>
            。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor={`comment-input-${matchId}`}
              className="block text-xs font-semibold text-slate-500"
            >
              发表评论
            </label>
            <textarea
              id={`comment-input-${matchId}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="说说你对这场比赛的看法..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {content.length}/500
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "发表中..." : "发表"}
              </button>
            </div>
            {submitError && (
              <p
                role="alert"
                className="text-sm font-semibold text-rose-700"
              >
                {submitError}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

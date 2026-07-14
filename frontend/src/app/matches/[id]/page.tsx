import Link from "next/link";
import { notFound } from "next/navigation";
import { BackendError, fetchBackend } from "@/lib/ssr";
import { CommentSection } from "@/components/comment-section";
import { FavoriteButton } from "@/components/favorite-button";
import { PredictionForm } from "@/components/prediction-form";
import { StateHandler } from "@/components/state-handler";
import { formatDateTime, stageLabel, statusLabel } from "@/lib/format";
import type { Comment, Match } from "@/lib/types";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId) || matchId < 1) {
    notFound();
  }

  const [matchResult, commentsResult] = await Promise.allSettled([
    fetchBackend<Match>(`/api/matches/${matchId}`),
    fetchBackend<Comment[]>(`/api/comments/${matchId}`),
  ]);

  if (matchResult.status === "rejected") {
    const reason = matchResult.reason;
    if (reason instanceof BackendError && reason.status === 404) {
      notFound();
    }
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
        <StateHandler status="error" error="无法加载比赛详情，请稍后重试。" />
      </main>
    );
  }

  const match = matchResult.value;
  const comments =
    commentsResult.status === "fulfilled" ? commentsResult.value : [];
  const finished = match.status === "finished";
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
      <Link
        href="/matches"
        className="mb-6 inline-block text-sm font-semibold text-blue-700 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
      >
        ← 返回赛程
      </Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-blue-700">
            {stageLabel(match.stage)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
            {statusLabel(match.status)}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            {match.homeTeam.flagUrl ? (
              <img
                src={match.homeTeam.flagUrl}
                alt={match.homeTeam.name}
                className="h-12 w-16 rounded object-cover"
              />
            ) : (
              <span className="flex h-12 w-16 items-center justify-center rounded bg-slate-200 text-sm font-bold text-slate-600">
                {match.homeTeam.code}
              </span>
            )}
            <span className="text-lg font-bold text-slate-950">
              {match.homeTeam.name}
            </span>
          </div>
          <div className="text-center">
            {finished && hasScore ? (
              <span className="text-4xl font-bold tabular-nums text-slate-950">
                {match.homeScore} : {match.awayScore}
              </span>
            ) : (
              <span className="text-lg font-semibold text-slate-400">VS</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            {match.awayTeam.flagUrl ? (
              <img
                src={match.awayTeam.flagUrl}
                alt={match.awayTeam.name}
                className="h-12 w-16 rounded object-cover"
              />
            ) : (
              <span className="flex h-12 w-16 items-center justify-center rounded bg-slate-200 text-sm font-bold text-slate-600">
                {match.awayTeam.code}
              </span>
            )}
            <span className="text-lg font-bold text-slate-950">
              {match.awayTeam.name}
            </span>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          {formatDateTime(match.kickoffTime)}
        </p>
        <div className="mt-6 flex justify-center">
          <FavoriteButton matchId={match.id} />
        </div>
      </section>

      {match.status === "scheduled" && (
        <div className="mt-8">
          <PredictionForm matchId={match.id} />
        </div>
      )}

      <div className="mt-8">
        <CommentSection matchId={match.id} initialComments={comments} />
      </div>
    </main>
  );
}

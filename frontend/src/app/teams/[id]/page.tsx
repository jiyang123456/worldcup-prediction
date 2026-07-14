import Link from "next/link";
import { notFound } from "next/navigation";
import { BackendError, fetchBackend } from "@/lib/ssr";
import { MatchCard } from "@/components/match-card";
import { StateHandler } from "@/components/state-handler";
import type { Match, Team } from "@/lib/types";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isInteger(teamId) || teamId < 1) {
    notFound();
  }

  const [teamResult, matchesResult] = await Promise.allSettled([
    fetchBackend<Team>(`/api/teams/${teamId}`),
    fetchBackend<Match[]>("/api/matches"),
  ]);

  if (teamResult.status === "rejected") {
    const reason = teamResult.reason;
    if (reason instanceof BackendError && reason.status === 404) {
      notFound();
    }
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
        <StateHandler status="error" error="无法加载球队信息，请稍后重试。" />
      </main>
    );
  }

  const team = teamResult.value;
  const matches =
    matchesResult.status === "fulfilled" ? matchesResult.value : [];
  const teamMatches = matches.filter(
    (m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <Link
        href="/teams"
        className="mb-6 inline-block text-sm font-semibold text-blue-700 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
      >
        ← 返回球队列表
      </Link>
      <header className="mb-10 flex items-center gap-5 border-b border-slate-200 pb-8">
        {team.flagUrl ? (
          <img
            src={team.flagUrl}
            alt={team.name}
            className="h-16 w-24 rounded object-cover"
          />
        ) : (
          <span className="flex h-16 w-24 items-center justify-center rounded bg-slate-200 text-lg font-bold text-slate-600">
            {team.code}
          </span>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-950">{team.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {team.code}
            {team.group ? ` · ${team.group} 组` : " · 淘汰赛"}
          </p>
        </div>
      </header>
      <section aria-labelledby="matches-heading">
        <h2
          id="matches-heading"
          className="mb-6 text-2xl font-bold text-slate-950"
        >
          相关比赛
        </h2>
        <StateHandler
          status={teamMatches.length === 0 ? "empty" : "success"}
          empty="该球队暂无比赛安排。"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {teamMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </StateHandler>
      </section>
    </main>
  );
}

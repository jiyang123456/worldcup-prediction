import Link from "next/link";
import { fetchBackend } from "@/lib/ssr";
import { MatchCard } from "@/components/match-card";
import { StateHandler } from "@/components/state-handler";
import type { Match } from "@/lib/types";

export default async function Home() {
  let matches: Match[] = [];
  let failed = false;
  try {
    matches = await fetchBackend<Match[]>("/api/matches?status=scheduled");
  } catch {
    failed = true;
  }
  const upcoming = matches.slice(0, 6);
  const status = failed
    ? "error"
    : upcoming.length === 0
      ? "empty"
      : "success";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-12 border-b border-slate-200 pb-10">
        <p className="mb-4 font-mono text-sm font-semibold tracking-[0.2em] text-blue-700 uppercase">
          FIFA World Cup 2026
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          2026 美加墨世界杯
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          查看赛程、提交比分预测、参与比赛讨论，与全球球迷一起见证每粒进球。
        </p>
      </header>
      <section aria-labelledby="upcoming-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="upcoming-heading"
            className="text-2xl font-bold text-slate-950"
          >
            即将开赛
          </h2>
          <Link
            href="/matches"
            className="text-sm font-semibold text-blue-700 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            查看全部 →
          </Link>
        </div>
        <StateHandler
          status={status}
          empty="暂无即将开赛的比赛。"
          error="无法加载比赛数据，请确认后端服务已启动。"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </StateHandler>
      </section>
    </main>
  );
}

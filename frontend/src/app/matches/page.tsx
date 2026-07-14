import Link from "next/link";
import { fetchBackend } from "@/lib/ssr";
import { MatchCard } from "@/components/match-card";
import { StateHandler } from "@/components/state-handler";
import type { Match, MatchStage } from "@/lib/types";

const stageTabs: { value: MatchStage | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "group", label: "小组赛" },
  { value: "r32", label: "32强" },
  { value: "r16", label: "16强" },
  { value: "qf", label: "四分之一决赛" },
  { value: "sf", label: "半决赛" },
  { value: "final", label: "决赛" },
];

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const query = stage ? `?stage=${stage}` : "";
  let matches: Match[] = [];
  let failed = false;
  try {
    matches = await fetchBackend<Match[]>(`/api/matches${query}`);
  } catch {
    failed = true;
  }
  const status = failed
    ? "error"
    : matches.length === 0
      ? "empty"
      : "success";
  const active = stage ?? "all";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-6 text-3xl font-bold text-slate-950">比赛赛程</h1>
      <nav aria-label="阶段筛选" className="mb-8 flex flex-wrap gap-2">
        {stageTabs.map((tab) => {
          const href =
            tab.value === "all" ? "/matches" : `/matches?stage=${tab.value}`;
          const isActive = active === tab.value;
          return (
            <Link
              key={tab.value}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:text-blue-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <StateHandler
        status={status}
        empty="该阶段暂无比赛。"
        error="无法加载比赛数据，请稍后重试。"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </StateHandler>
    </main>
  );
}

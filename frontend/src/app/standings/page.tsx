import Link from "next/link";
import { fetchBackend } from "@/lib/ssr";
import { StandingsTable } from "@/components/standings-table";
import { StateHandler } from "@/components/state-handler";
import type { Standing, TeamGroup } from "@/lib/types";

const groups: TeamGroup[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const selectedGroup = (group ?? "A") as TeamGroup;
  let standings: Standing[] = [];
  let failed = false;
  try {
    standings = await fetchBackend<Standing[]>(
      `/api/standings?group=${selectedGroup}`,
    );
  } catch {
    failed = true;
  }
  const status = failed
    ? "error"
    : standings.length === 0
      ? "empty"
      : "success";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-6 text-3xl font-bold text-slate-950">小组积分榜</h1>
      <nav aria-label="小组筛选" className="mb-8 flex flex-wrap gap-2">
        {groups.map((g) => {
          const isActive = selectedGroup === g;
          return (
            <Link
              key={g}
              href={`/standings?group=${g}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:text-blue-700"
              }`}
            >
              {g} 组
            </Link>
          );
        })}
      </nav>
      <StateHandler
        status={status}
        empty="该小组暂无积分数据。"
        error="无法加载积分榜，请稍后重试。"
      >
        <StandingsTable standings={standings} />
      </StateHandler>
    </main>
  );
}

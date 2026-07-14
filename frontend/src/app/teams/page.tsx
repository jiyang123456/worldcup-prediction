import Link from "next/link";
import { fetchBackend } from "@/lib/ssr";
import { StateHandler } from "@/components/state-handler";
import type { Team } from "@/lib/types";

export default async function TeamsPage() {
  let teams: Team[] = [];
  let failed = false;
  try {
    teams = await fetchBackend<Team[]>("/api/teams");
  } catch {
    failed = true;
  }
  const status = failed
    ? "error"
    : teams.length === 0
      ? "empty"
      : "success";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-950">参赛球队</h1>
      <StateHandler
        status={status}
        empty="暂无球队数据。"
        error="无法加载球队数据，请稍后重试。"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              {team.flagUrl ? (
                <img
                  src={team.flagUrl}
                  alt={team.name}
                  className="h-10 w-14 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-10 w-14 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
                  {team.code}
                </span>
              )}
              <div>
                <p className="font-bold text-slate-950">{team.name}</p>
                <p className="text-xs text-slate-500">
                  {team.code}
                  {team.group ? ` · ${team.group} 组` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </StateHandler>
    </main>
  );
}

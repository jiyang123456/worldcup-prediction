import { fetchBackend } from "@/lib/ssr";
import { KnockoutBracket } from "@/components/knockout-bracket";
import { StateHandler } from "@/components/state-handler";
import type { Match } from "@/lib/types";

const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "third", "final"] as const;

export default async function KnockoutPage() {
  let matches: Match[] = [];
  let failed = false;
  try {
    const allMatches = await fetchBackend<Match[]>("/api/matches");
    matches = allMatches.filter((m) => KNOCKOUT_STAGES.includes(m.stage as typeof KNOCKOUT_STAGES[number]));
  } catch {
    failed = true;
  }

  const bracket: Record<string, Match[]> = {};
  for (const stage of KNOCKOUT_STAGES) {
    bracket[stage] = matches.filter((m) => m.stage === stage);
  }

  const hasMatches = Object.values(bracket).some((arr) => arr.length > 0);
  const status = failed ? "error" : hasMatches ? "success" : "empty";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-950">淘汰赛对阵</h1>
      <StateHandler
        status={status}
        empty="淘汰赛对阵尚未生成。"
        error="无法加载淘汰赛数据，请稍后重试。"
      >
        <KnockoutBracket bracket={bracket} />
      </StateHandler>
    </main>
  );
}

import { fetchBackend } from "@/lib/ssr";
import { KnockoutBracket } from "@/components/knockout-bracket";
import { StateHandler } from "@/components/state-handler";
import type { KnockoutBracket as KnockoutBracketData } from "@/lib/types";

export default async function KnockoutPage() {
  let bracket: KnockoutBracketData | null = null;
  let failed = false;
  try {
    bracket = await fetchBackend<KnockoutBracketData>("/api/knockout");
  } catch {
    failed = true;
  }
  const hasMatches = bracket
    ? Object.values(bracket).some((matches) => matches.length > 0)
    : false;
  const status = failed ? "error" : hasMatches ? "success" : "empty";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-950">淘汰赛对阵</h1>
      <StateHandler
        status={status}
        empty="淘汰赛对阵尚未生成。"
        error="无法加载淘汰赛数据，请稍后重试。"
      >
        {bracket ? <KnockoutBracket bracket={bracket} /> : null}
      </StateHandler>
    </main>
  );
}

import type { Match } from "@/lib/types";
import { stageLabel } from "@/lib/format";
import { MatchCard } from "@/components/match-card";

const stages: { key: string; label: string }[] = [
  { key: "r32", label: stageLabel("r32") },
  { key: "r16", label: stageLabel("r16") },
  { key: "qf", label: stageLabel("qf") },
  { key: "sf", label: stageLabel("sf") },
  { key: "third", label: stageLabel("third") },
  { key: "final", label: stageLabel("final") },
];

export function KnockoutBracket({ bracket }: { bracket: Record<string, Match[]> }) {
  return (
    <div className="space-y-10">
      {stages.map(({ key, label }) => {
        const matches = bracket[key];
        if (!matches || matches.length === 0) {
          return null;
        }
        return (
          <section key={key} aria-labelledby={`${key}-heading`}>
            <h2
              id={`${key}-heading`}
              className="mb-4 text-xl font-bold text-slate-950"
            >
              {label}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { Match, MatchStatus, Team } from "@/lib/types";
import { formatDateTime, stageLabel, statusLabel } from "@/lib/format";

const statusStyles: Record<MatchStatus, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  live: "bg-rose-100 text-rose-700",
  finished: "bg-emerald-100 text-emerald-700",
};

function Flag({ team }: { team: Team }) {
  if (team.flagUrl) {
    return (
      <img
        src={team.flagUrl}
        alt={team.name}
        className="h-8 w-12 rounded object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="flex h-8 w-12 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
      {team.code}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const finished = match.status === "finished";
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
    >
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-mono font-semibold text-blue-700">
          {stageLabel(match.stage)}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 font-semibold ${statusStyles[match.status]}`}
        >
          {statusLabel(match.status)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <Flag team={match.homeTeam} />
          <span className="text-sm font-semibold text-slate-900">
            {match.homeTeam.name}
          </span>
        </div>
        <div className="text-center">
          {finished && hasScore ? (
            <span className="text-2xl font-bold tabular-nums text-slate-950">
              {match.homeScore} : {match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-400">VS</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Flag team={match.awayTeam} />
          <span className="text-sm font-semibold text-slate-900">
            {match.awayTeam.name}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        {formatDateTime(match.kickoffTime)}
      </p>
    </Link>
  );
}

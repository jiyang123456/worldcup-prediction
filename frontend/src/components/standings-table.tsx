import type { Standing } from "@/lib/types";

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <th scope="col" className="px-3 py-3 text-left font-semibold">
              #
            </th>
            <th scope="col" className="px-3 py-3 text-left font-semibold">
              球队
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              场
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              胜
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              平
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              负
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              进球
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              失球
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              净胜
            </th>
            <th scope="col" className="px-3 py-3 text-center font-semibold">
              积分
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => (
            <tr key={row.teamId} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-3 text-slate-500">{index + 1}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  {row.flagUrl ? (
                    <img
                      src={row.flagUrl}
                      alt={row.teamName}
                      className="h-5 w-7 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-5 w-7 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600">
                      {row.teamCode}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900">
                    {row.teamName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-center tabular-nums">{row.played}</td>
              <td className="px-3 py-3 text-center tabular-nums">{row.won}</td>
              <td className="px-3 py-3 text-center tabular-nums">{row.drawn}</td>
              <td className="px-3 py-3 text-center tabular-nums">{row.lost}</td>
              <td className="px-3 py-3 text-center tabular-nums">
                {row.goalsFor}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {row.goalsAgainst}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">
                {row.goalDifference > 0
                  ? `+${row.goalDifference}`
                  : row.goalDifference}
              </td>
              <td className="px-3 py-3 text-center text-base font-bold tabular-nums text-slate-950">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

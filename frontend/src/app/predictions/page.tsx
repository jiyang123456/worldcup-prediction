"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StateHandler, type StateStatus } from "@/components/state-handler";
import { formatDateTime, stageLabel } from "@/lib/format";
import type { Match, Prediction } from "@/lib/types";

export default function PredictionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [matchMap, setMatchMap] = useState<Map<number, Match>>(new Map());
  const [status, setStatus] = useState<StateStatus>("loading");

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;
      setStatus("loading");
      try {
        const [predRes, matchRes] = await Promise.all([
          api.get<{ data: Prediction[] }>("/api/predictions"),
          api.get<{ data: Match[] }>("/api/matches"),
        ]);
        if (!active) return;
        setPredictions(predRes.data);
        setMatchMap(new Map(matchRes.data.map((m) => [m.id, m])));
        setStatus(predRes.data.length === 0 ? "empty" : "success");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-950">我的预测</h1>
        <StateHandler status="loading" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-950">我的预测</h1>
        <StateHandler
          status="empty"
          empty={
            <p className="text-sm text-slate-600">
              请先
              <Link
                href="/login"
                className="mx-1 font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                登录
              </Link>
              后查看预测。
            </p>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-6 text-3xl font-bold text-slate-950">我的预测</h1>
      <StateHandler
        status={status}
        empty="你还没有任何预测"
        error="无法加载预测数据，请稍后重试。"
      >
        <ul className="space-y-4">
          {predictions.map((pred) => {
            const match = matchMap.get(pred.matchId) ?? pred.match;
            return (
              <li key={pred.id}>
                <Link
                  href={`/matches/${pred.matchId}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                >
                  <div className="mb-3 flex items-center justify-between text-xs">
                    {match ? (
                      <span className="font-mono font-semibold text-blue-700">
                        {stageLabel(match.stage)}
                      </span>
                    ) : (
                      <span className="font-mono font-semibold text-slate-400">
                        比赛 #{pred.matchId}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                      {pred.points === null ? "待结算" : `${pred.points} 分`}
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <span className="text-center text-sm font-semibold text-slate-900">
                      {match?.homeTeam.name ?? "主队"}
                    </span>
                    <span className="text-center text-2xl font-bold tabular-nums text-slate-950">
                      {pred.homeScore} : {pred.awayScore}
                    </span>
                    <span className="text-center text-sm font-semibold text-slate-900">
                      {match?.awayTeam.name ?? "客队"}
                    </span>
                  </div>
                  {match && (
                    <p className="mt-3 text-center text-xs text-slate-500">
                      {formatDateTime(match.kickoffTime)}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </StateHandler>
    </main>
  );
}

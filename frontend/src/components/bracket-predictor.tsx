"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StateHandler, type StateStatus } from "@/components/state-handler";
import { stageLabel, statusLabel } from "@/lib/format";
import type { Match, Prediction } from "@/lib/types";

const STAGES = ["r32", "r16", "qf", "sf", "third", "final"] as const;

function TeamFlag({ name, code, flagUrl }: { name: string; code: string; flagUrl: string | null }) {
  if (flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={name}
        className="h-6 w-9 rounded object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="flex h-6 w-9 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
      {code}
    </span>
  );
}

function MatchPredictionRow({
  match,
  prediction,
  savingId,
  savedIds,
  onSave,
}: {
  match: Match;
  prediction: Prediction | null;
  savingId: number | null;
  savedIds: Set<number>;
  onSave: (matchId: number, homeScore: number, awayScore: number) => void;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction ? String(prediction.homeScore) : "0"
  );
  const [awayScore, setAwayScore] = useState(
    prediction ? String(prediction.awayScore) : "0"
  );
  const [error, setError] = useState<string | null>(null);
  const locked = match.status !== "scheduled";

  const isSaving = savingId === match.id;
  const isSaved = savedIds.has(match.id);
  const hasExisting = prediction !== null;

  const home = Number(homeScore);
  const away = Number(awayScore);
  const hasChanged =
    !hasExisting || home !== prediction.homeScore || away !== prediction.awayScore;

  function submit() {
    const homeNum = Number(homeScore);
    const awayNum = Number(awayScore);
    if (
      !Number.isInteger(homeNum) ||
      homeNum < 0 ||
      homeNum > 20 ||
      !Number.isInteger(awayNum) ||
      awayNum < 0 ||
      awayNum > 20
    ) {
      setError("比分需为 0-20 的整数");
      return;
    }
    setError(null);
    onSave(match.id, homeNum, awayNum);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-mono font-semibold text-blue-700">
          {stageLabel(match.stage)}
        </span>
        <span className="text-slate-500">{statusLabel(match.status)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <TeamFlag
            name={match.homeTeam.name}
            code={match.homeTeam.code}
            flagUrl={match.homeTeam.flagUrl}
          />
          <span className="text-xs font-semibold text-slate-900">
            {match.homeTeam.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={20}
            step={1}
            value={homeScore}
            onChange={(e) => {
              setHomeScore(e.target.value);
              setError(null);
            }}
            disabled={locked}
            className="w-12 rounded-md border border-slate-300 px-1 py-1.5 text-center text-sm font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-sm font-bold text-slate-400">:</span>
          <input
            type="number"
            min={0}
            max={20}
            step={1}
            value={awayScore}
            onChange={(e) => {
              setAwayScore(e.target.value);
              setError(null);
            }}
            disabled={locked}
            className="w-12 rounded-md border border-slate-300 px-1 py-1.5 text-center text-sm font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <TeamFlag
            name={match.awayTeam.name}
            code={match.awayTeam.code}
            flagUrl={match.awayTeam.flagUrl}
          />
          <span className="text-xs font-semibold text-slate-900">
            {match.awayTeam.name}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex-1">
          {hasExisting && (
            <p className="text-xs text-slate-500">
              当前: {prediction.homeScore} : {prediction.awayScore}
            </p>
          )}
          {isSaved && !isSaving && (
            <p role="status" className="text-xs font-semibold text-emerald-700">
              已保存
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}
        </div>
        {!locked && (
          <button
            type="button"
            onClick={submit}
            disabled={isSaving || !hasChanged}
            className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        )}
      </div>
    </div>
  );
}

export function BracketPredictor() {
  const { user, loading: authLoading } = useAuth();
  const [bracket, setBracket] = useState<Record<string, Match[]>>({});
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [status, setStatus] = useState<StateStatus>("loading");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

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
        const [knockoutRes, predsRes] = await Promise.all([
          api.get<{ data: Record<string, Match[]> }>("/api/knockout"),
          api.get<{ data: Prediction[] }>("/api/predictions"),
        ]);
        if (!active) return;
        setBracket(knockoutRes.data);
        setPredictions(predsRes.data);
        const anyMatches = Object.values(knockoutRes.data).some(
          (arr) => arr.length > 0
        );
        setStatus(anyMatches ? "success" : "empty");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSave(matchId: number, homeScore: number, awayScore: number) {
    setSavingId(matchId);
    try {
      await api.post<{ data: Prediction }>("/api/predictions", {
        matchId,
        homeScore,
        awayScore,
      });
      setPredictions((prev) => {
        const rest = prev.filter((p) => p.matchId !== matchId);
        return [
          ...rest,
          {
            id: Date.now(),
            userId: user!.id,
            matchId,
            homeScore,
            awayScore,
            points: null,
            createdAt: new Date().toISOString(),
          },
        ];
      });
      setSavedIds((prev) => new Set(prev).add(matchId));
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "PREDICTION_LOCKED") {
        setBracket((prev) => {
          const next = { ...prev };
          for (const stage of Object.keys(next)) {
            next[stage] = next[stage].map((m) =>
              m.id === matchId ? { ...m, status: "live" as const } : m
            );
          }
          return next;
        });
      }
    } finally {
      setSavingId(null);
    }
  }

  function getPrediction(matchId: number): Prediction | null {
    return predictions.find((p) => p.matchId === matchId) ?? null;
  }

  if (authLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-8 text-3xl font-bold text-slate-950">淘汰赛预测</h1>
        <StateHandler status="loading" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-8 text-3xl font-bold text-slate-950">淘汰赛预测</h1>
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
              后参与淘汰赛预测。
            </p>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-8 text-3xl font-bold text-slate-950">淘汰赛预测</h1>
      <StateHandler
        status={status}
        empty="淘汰赛对阵尚未生成。"
        error="无法加载淘汰赛数据，请稍后重试。"
      >
        <div className="space-y-10">
          {STAGES.map((stage) => {
            const matches = bracket[stage];
            if (!matches || matches.length === 0) {
              return null;
            }
            return (
              <section key={stage} aria-labelledby={`bp-${stage}-heading`}>
                <h2
                  id={`bp-${stage}-heading`}
                  className="mb-4 text-xl font-bold text-slate-950"
                >
                  {stageLabel(stage)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matches.map((match) => (
                    <MatchPredictionRow
                      key={match.id}
                      match={match}
                      prediction={getPrediction(match.id)}
                      savingId={savingId}
                      savedIds={savedIds}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </StateHandler>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StateHandler, type StateStatus } from "@/components/state-handler";
import type { Prediction } from "@/lib/types";

export function PredictionForm({ matchId }: { matchId: number }) {
  const { user, loading: authLoading } = useAuth();
  const [existing, setExisting] = useState<Prediction | null>(null);
  const [fetchState, setFetchState] = useState<"loading" | "error" | "done">(
    "loading",
  );
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;
      setFetchState("loading");
      try {
        const res = await api.get<{ data: Prediction | null }>(
          `/api/predictions/${matchId}`,
        );
        if (!active) return;
        setExisting(res.data);
        if (res.data) {
          setHomeScore(String(res.data.homeScore));
          setAwayScore(String(res.data.awayScore));
        }
        setFetchState("done");
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiRequestError && err.status === 404) {
          setExisting(null);
          setFetchState("done");
        } else {
          setFetchState("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user, matchId]);

  let status: StateStatus;
  if (authLoading) {
    status = "loading";
  } else if (!user) {
    status = "empty";
  } else if (fetchState === "loading") {
    status = "loading";
  } else if (fetchState === "error") {
    status = "error";
  } else {
    status = "success";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (
      !Number.isInteger(home) ||
      home < 0 ||
      home > 20 ||
      !Number.isInteger(away) ||
      away < 0 ||
      away > 20
    ) {
      setSubmitError("比分需为 0-20 的整数");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSaved(false);
    setLocked(false);
    try {
      const res = await api.post<{ data: Prediction }>("/api/predictions", {
        matchId,
        homeScore: home,
        awayScore: away,
      });
      setExisting(res.data);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "PREDICTION_LOCKED") {
        setLocked(true);
      } else {
        setSubmitError(
          err instanceof Error ? err.message : "提交失败，请稍后重试",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      data-match-id={matchId}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="mb-4 text-lg font-bold text-slate-950">比分预测</h2>
      <StateHandler
        status={status}
        empty={
          <p className="text-sm text-slate-600">
            请先登录后参与预测，前往{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              登录
            </Link>
            。
          </p>
        }
        error="无法加载预测数据，请稍后重试。"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-slate-500">主队</span>
              <input
                type="number"
                min={0}
                max={20}
                step={1}
                value={homeScore}
                onChange={(e) => {
                  setHomeScore(e.target.value);
                  setSaved(false);
                }}
                required
                className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-lg font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </label>
            <span className="text-lg font-bold text-slate-400">:</span>
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-slate-500">客队</span>
              <input
                type="number"
                min={0}
                max={20}
                step={1}
                value={awayScore}
                onChange={(e) => {
                  setAwayScore(e.target.value);
                  setSaved(false);
                }}
                required
                className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-lg font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </label>
          </div>
          {existing && (
            <p className="text-center text-xs text-slate-500">
              当前预测：{existing.homeScore} : {existing.awayScore}
            </p>
          )}
          {saved && (
            <p
              role="status"
              className="text-center text-sm font-semibold text-emerald-700"
            >
              预测已保存。
            </p>
          )}
          {locked && (
            <p
              role="alert"
              className="text-center text-sm font-semibold text-rose-700"
            >
              比赛已开始，无法修改预测。
            </p>
          )}
          {submitError && (
            <p
              role="alert"
              className="text-center text-sm font-semibold text-rose-700"
            >
              {submitError}
            </p>
          )}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting || locked}
              className="rounded-full bg-slate-950 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "提交中..." : "提交预测"}
            </button>
          </div>
        </form>
      </StateHandler>
    </div>
  );
}

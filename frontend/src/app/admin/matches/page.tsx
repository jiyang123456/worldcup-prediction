"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StateHandler, type StateStatus } from "@/components/state-handler";
import { formatDateTime, stageLabel, statusLabel } from "@/lib/format";
import type { Match } from "@/lib/types";

export default function AdminMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<StateStatus>("loading");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHome, setEditHome] = useState("0");
  const [editAway, setEditAway] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const refreshMatches = useCallback(async () => {
    try {
      const res = await api.get<{ data: Match[] }>("/api/matches");
      setMatches(res.data);
      setStatus(res.data.length === 0 ? "empty" : "success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;
      await refreshMatches();
    })();
    return () => {
      active = false;
    };
  }, [user, refreshMatches]);

  function startEdit(match: Match) {
    setEditingId(match.id);
    setEditHome(match.homeScore !== null ? String(match.homeScore) : "0");
    setEditAway(match.awayScore !== null ? String(match.awayScore) : "0");
    setSubmitError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setSubmitError(null);
  }

  async function confirmResult(matchId: number, e: FormEvent) {
    e.preventDefault();
    const home = Number(editHome);
    const away = Number(editAway);
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
    try {
      await api.patch<{ data: Match }>(`/api/admin/matches/${matchId}/result`, {
        homeScore: home,
        awayScore: away,
      });
      setEditingId(null);
      await refreshMatches();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "录入失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-950">比赛结果录入</h1>
        <StateHandler status="loading" />
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-950">比赛结果录入</h1>
        <StateHandler status="empty" empty="需要管理员权限" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="mb-6 text-3xl font-bold text-slate-950">比赛结果录入</h1>
      <StateHandler
        status={status}
        empty="暂无比赛。"
        error="无法加载比赛数据，请稍后重试。"
      >
        <ul className="space-y-3">
          {matches.map((match) => {
            const hasResult =
              match.homeScore !== null && match.awayScore !== null;
            const isEditing = editingId === match.id;
            return (
              <li
                key={match.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-blue-700">
                        {stageLabel(match.stage)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {statusLabel(match.status)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(match.kickoffTime)}
                      {hasResult && (
                        <span className="ml-2 font-semibold text-emerald-700">
                          当前结果：{match.homeScore} : {match.awayScore}
                        </span>
                      )}
                    </p>
                  </div>
                  {isEditing ? (
                    <form
                      onSubmit={(e) => confirmResult(match.id, e)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={1}
                        value={editHome}
                        onChange={(e) => setEditHome(e.target.value)}
                        required
                        aria-label="主队比分"
                        className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      />
                      <span className="text-sm font-bold text-slate-400">:</span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={1}
                        value={editAway}
                        onChange={(e) => setEditAway(e.target.value)}
                        required
                        aria-label="客队比分"
                        className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm font-bold tabular-nums text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? "保存中..." : "确认"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                      >
                        取消
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(match)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-700 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                    >
                      {hasResult ? "修改结果" : "录入结果"}
                    </button>
                  )}
                </div>
                {isEditing && submitError && (
                  <p
                    role="alert"
                    className="mt-2 text-sm font-semibold text-rose-700"
                  >
                    {submitError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </StateHandler>
    </main>
  );
}

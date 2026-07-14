"use client";

export function PredictionForm({ matchId }: { matchId: number }) {
  return (
    <div
      data-match-id={matchId}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="mb-3 text-lg font-bold text-slate-950">比分预测</h2>
      <p className="text-sm text-slate-500">比分预测功能加载中...</p>
    </div>
  );
}

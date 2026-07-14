"use client";

export function FavoriteButton({ matchId }: { matchId: number }) {
  return (
    <button
      type="button"
      data-match-id={matchId}
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-700 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
    >
      ☆ 收藏
    </button>
  );
}

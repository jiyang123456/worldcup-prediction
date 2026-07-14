"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Favorite } from "@/lib/types";

export function FavoriteButton({ matchId }: { matchId: number }) {
  const { user, loading: authLoading } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!user) {
        setLoaded(false);
        return;
      }
      try {
        const res = await api.get<{ data: Favorite[] }>("/api/favorites");
        if (!active) return;
        setFavorited(res.data.some((f) => f.matchId === matchId));
      } catch {
        // 忽略错误，按钮保持默认状态
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, matchId]);

  if (authLoading || !user || !loaded) {
    return null;
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (favorited) {
        await api.delete<{ data: { success: boolean } }>(
          `/api/favorites/${matchId}`,
        );
        setFavorited(false);
      } else {
        await api.post<{ data: Favorite }>("/api/favorites", { matchId });
        setFavorited(true);
      }
    } catch {
      // 保持当前状态
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      data-match-id={matchId}
      onClick={toggle}
      disabled={busy}
      aria-pressed={favorited}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${
        favorited
          ? "border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:text-blue-700"
      }`}
    >
      {favorited ? "★ 已收藏" : "☆ 收藏"}
    </button>
  );
}

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
      >
        <h2 className="text-xl font-bold">页面出错了</h2>
        <p className="mt-2 text-sm">
          {error.message || "页面加载时发生未知错误，请稍后重试。"}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          重试
        </button>
      </div>
    </div>
  );
}

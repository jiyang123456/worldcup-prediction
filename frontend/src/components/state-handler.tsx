import type { ReactNode } from "react";

export type StateStatus = "loading" | "empty" | "error" | "success";

type StateHandlerProps = {
  status: StateStatus;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  children?: ReactNode;
};

export function StateHandler({
  status,
  loading,
  empty,
  error,
  children,
}: StateHandlerProps) {
  if (status === "loading") {
    return (
      <div aria-busy="true" aria-live="polite">
        {loading ?? (
          <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
      >
        {error ?? "加载失败，请稍后重试。"}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
        {empty ?? "暂无数据"}
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/matches", label: "比赛" },
  { href: "/standings", label: "积分榜" },
  { href: "/knockout", label: "淘汰赛" },
  { href: "/teams", label: "球队" },
] as const;

export function NavBar() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="text-lg font-bold text-slate-950 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          世界杯预测
        </Link>
        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="font-semibold text-slate-950">
                {user.username}
              </span>
              <Link
                href="/predictions"
                className="text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                我的预测
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/matches"
                  className="text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                >
                  结果录入
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

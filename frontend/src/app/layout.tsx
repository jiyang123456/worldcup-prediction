import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { NavBar } from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "世界杯赛事预测平台",
  description: "2026 美加墨世界杯赛事信息与互动预测平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

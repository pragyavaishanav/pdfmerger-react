"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";
import { Workspace } from "@/app/components/workspace";

const THEME_KEY = "dopeoffice-theme";

export default function Home() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const filesCount = useAppStore((s) => s.files.length);
  const toast = useAppStore((s) => s.toast);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as
        | "light"
        | "dark"
        | null;
      if (stored) setTheme(stored);
    } catch {
      // ignore
    }
  }, [setTheme]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("empty-state", filesCount === 0);
  }, [filesCount]);

  return (
    <>
      <div className="site-bg">
        <div className="dot-pattern" aria-hidden />
      </div>

      <Header />

      <main className="main-layout" id="main-layout">
        <Sidebar />
        <Workspace />
      </main>

      <div
        className={`toast ${toast.show ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast.msg}
      </div>
    </>
  );
}

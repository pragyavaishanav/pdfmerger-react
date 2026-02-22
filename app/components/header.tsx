"use client";

import { useAppStore } from "@/lib/store";

export function Header() {
  const files = useAppStore((s) => s.files);
  const queueLength = useAppStore((s) => s.queue.length);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const totalPages = files.reduce((a, b) => a + b.page_count, 0);

  return (
    <header className="app-header" id="app-header">
      <div className="header-inner">
        <div className="header-logo">
          <div className="logo-mark" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect
                x="2"
                y="4"
                width="14"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="10"
                y="6"
                width="14"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
          </div>
          <span className="logo-text">
            DOPE<em>OFFICE</em> PDF MERGER
          </span>
        </div>
        <div className="header-actions">
          <nav className="header-stats">
            <span className="stat-item">
              <span className="stat-val">{files.length}</span> files
            </span>
            <span className="stat-dot" />
            <span className="stat-item">
              <span className="stat-val">{totalPages}</span> pages
            </span>
            <span className="stat-dot" />
            <span className="stat-item accent">
              <span className="stat-val">{queueLength}</span> selected
            </span>
          </nav>
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={toggleTheme}
          >
            <span className="theme-toggle-icon" aria-hidden>
              {theme === "light" ? "◐" : "☼"}
            </span>
            <span className="theme-toggle-label">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

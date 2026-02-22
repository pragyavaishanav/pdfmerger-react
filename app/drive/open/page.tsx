"use client";

import { useEffect, useState } from "react";
import { useCustomSearchParams } from "./useCustomSearchParams";
import { useAppStore } from "@/lib/store";
import type { UploadedFile } from "@/lib/types";
import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";
import { Workspace } from "@/app/components/workspace";

const THEME_KEY = "dopeoffice-theme";

export default function DriveOpenPage() {
  const { stateParam, code } = useCustomSearchParams();
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

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

  useEffect(() => {
    if (stateParam === undefined || code === undefined) return;

    if (!stateParam || !code) {
      setError(
        "Missing required URL parameters. Please open this file from Google Drive."
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadFiles() {
      try {
        const state = JSON.parse(stateParam!);
        const fileIds: string[] = state.ids || [];

        if (fileIds.length === 0) {
          setError("No file IDs found in the Google Drive state parameter");
          setLoading(false);
          return;
        }

        const tokenRes = await fetch("/api/drive/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          const { error: errMsg } = await tokenRes
            .json()
            .catch(() => ({ error: "Unknown error" }));
          setError(errMsg || "Failed to get access token");
          setLoading(false);
          return;
        }

        const { accessToken } = await tokenRes.json();

        setProgress({ done: 0, total: fileIds.length });

        for (let i = 0; i < fileIds.length; i++) {
          if (cancelled) return;

          const fileId = fileIds[i];
          setProgress({ done: i, total: fileIds.length });

          try {
            const importRes = await fetch("/api/drive/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileId, accessToken }),
            });

            if (!importRes.ok) {
              const err = await importRes
                .json()
                .catch(() => ({ error: "Import failed" }));
              useAppStore
                .getState()
                .showToast(`Failed to import file: ${err.error}`);
              continue;
            }

            const data = await importRes.json();

            const uploaded: UploadedFile = {
              file_id: data.file_id,
              original_name: data.original_name,
              page_count: data.page_count,
              thumbnails: data.thumbnails,
              pages: data.thumbnails.map(() => ({ rotation: 0 })),
            };

            const pages = data.thumbnails.map((_: string, idx: number) => ({
              file_id: data.file_id,
              page_index: idx,
            }));

            useAppStore.getState().addFile(uploaded, pages);
          } catch (fileErr) {
            useAppStore
              .getState()
              .showToast(
                `Error importing file: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}`
              );
          }

          setProgress({ done: i + 1, total: fileIds.length });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load files"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFiles();

    return () => {
      cancelled = true;
    };
  }, [stateParam, code]);

  if (error) {
    return (
      <>
        <div className="site-bg">
          <div className="dot-pattern" aria-hidden />
        </div>
        <Header />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 60px)",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <p style={{ color: "var(--accent)", fontSize: "1.1rem" }}>
              {error}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="site-bg">
          <div className="dot-pattern" aria-hidden />
        </div>
        <Header />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 60px)",
            gap: "1rem",
          }}
        >
          <div className="upload-spinner" />
          <p>Loading files from Google Drive…</p>
          {progress.total > 0 && (
            <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>
              {progress.done}/{progress.total} files imported
            </p>
          )}
        </div>
      </>
    );
  }

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

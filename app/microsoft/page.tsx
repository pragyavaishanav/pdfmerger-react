"use client";

import { useEffect, useState, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import type { UploadedFile } from "@/lib/types";
import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";
import { Workspace } from "@/app/components/workspace";
import OneDrivePicker, { type OneDriveFile } from "./one-drive-picker";

const THEME_KEY = "dopeoffice-theme";

type Stage = "pick" | "importing" | "workspace";

export default function MicrosoftPage() {
  const { data: session, status } = useSession();
  const [stage, setStage] = useState<Stage>("pick");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const filesCount = useAppStore((s) => s.files.length);
  const toast = useAppStore((s) => s.toast);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      if (stored) setTheme(stored);
    } catch {}
  }, [setTheme]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("empty-state", filesCount === 0 && stage !== "importing");
  }, [filesCount, stage]);

  const accessToken = (session as any)?.accessToken as string | undefined;

  const handleFilesPicked = useCallback(
    async (files: OneDriveFile[]) => {
      if (!accessToken || files.length === 0) return;

      setStage("importing");
      setError(null);
      setProgress({ done: 0, total: files.length });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ done: i, total: files.length });

        try {
          const res = await fetch("/api/microsoft/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: file.id,
              accessToken,
              fileName: file.name,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Import failed" }));
            useAppStore.getState().showToast(`Failed to import: ${err.error}`);
            continue;
          }

          const data = await res.json();

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
              `Error importing: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}`
            );
        }

        setProgress({ done: i + 1, total: files.length });
      }

      setStage("workspace");
    },
    [accessToken]
  );

  // Auth loading state
  if (status === "loading") {
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
          }}
        >
          <div className="upload-spinner" />
        </div>
      </>
    );
  }

  // Not signed in
  if (!session) {
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
            gap: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.4rem" }}>Import PDFs from OneDrive</h2>
          <p style={{ opacity: 0.6, maxWidth: 400, textAlign: "center" }}>
            Sign in with your Microsoft account to pick PDF files from OneDrive.
          </p>
          <Button onClick={() => signIn("azure-ad")} size="lg">
            Sign in with Microsoft
          </Button>
        </div>
      </>
    );
  }

  // Error state
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
            <p style={{ color: "var(--accent)", fontSize: "1.1rem" }}>{error}</p>
          </div>
        </div>
      </>
    );
  }

  // Importing files
  if (stage === "importing") {
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
          <p>Importing files from OneDrive…</p>
          {progress.total > 0 && (
            <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>
              {progress.done}/{progress.total} files imported
            </p>
          )}
        </div>
      </>
    );
  }

  // Workspace view (after files are imported)
  if (stage === "workspace" && filesCount > 0) {
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

  // Picker view (signed in, ready to pick files)
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
        <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
          Signed in as {session.user?.email}
          <button
            onClick={() => signOut()}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              marginLeft: 8,
              textDecoration: "underline",
            }}
          >
            Sign out
          </button>
        </p>
        <OneDrivePicker onFilesPicked={handleFilesPicked} />
      </div>
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

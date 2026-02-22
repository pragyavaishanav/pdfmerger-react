"use client";

import { useState, useCallback, useEffect } from "react";
import type { UploadedFile, QueueItem } from "@/lib/types";

const THEME_KEY = "dopeoffice-theme";

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "read">("grid");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    done: 0,
    total: 0,
    filename: "",
  });
  const [toast, setToast] = useState({ msg: "", show: false });
  const [draggedFileIdx, setDraggedFileIdx] = useState<number | null>(null);
  const [draggedPage, setDraggedPage] = useState<{
    fid: string;
    pid: number;
  } | null>(null);
  const [merging, setMerging] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    let stored: "light" | "dark" = "dark";
    try {
      stored = (localStorage.getItem(THEME_KEY) as "light" | "dark") || "dark";
    } catch {
      // ignore
    }
    setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("empty-state", files.length === 0);
  }, [files.length]);

  const selectedCountForFile = useCallback(
    (fid: string) => queue.filter((q) => q.file_id === fid).length,
    [queue]
  );

  const buildQueueMeta = useCallback(() => {
    const queueIndexByKey = new Map<string, number>();
    const selectedByFile = new Map<string, number>();
    queue.forEach((item, idx) => {
      queueIndexByKey.set(`${item.file_id}:${item.page_index}`, idx + 1);
      selectedByFile.set(
        item.file_id,
        (selectedByFile.get(item.file_id) || 0) + 1
      );
    });
    return { queueIndexByKey, selectedByFile };
  }, [queue]);

  const isInQueue = useCallback(
    (fid: string, pid: number) =>
      queue.some((q) => q.file_id === fid && q.page_index === pid),
    [queue]
  );

  const togglePage = useCallback(
    (fid: string, pid: number) => {
      const idx = queue.findIndex(
        (q) => q.file_id === fid && q.page_index === pid
      );
      if (idx > -1) {
        setQueue((q) => q.filter((_, i) => i !== idx));
      } else {
        const fileIdx = files.findIndex((f) => f.file_id === fid);
        let insertAt = queue.length;
        for (let i = queue.length - 1; i >= 0; i--) {
          const qi = files.findIndex((f) => f.file_id === queue[i].file_id);
          if (
            qi < fileIdx ||
            (qi === fileIdx && queue[i].page_index < pid)
          ) {
            insertAt = i + 1;
            break;
          }
          if (i === 0) insertAt = 0;
        }
        setQueue((q) => {
          const next = [...q];
          next.splice(insertAt, 0, { file_id: fid, page_index: pid });
          return next;
        });
      }
    },
    [queue, files]
  );

  const rotatePage = useCallback(
    (fid: string, pid: number, deg: number) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.file_id !== fid) return f;
          const pages = [...f.pages];
          pages[pid] = {
            rotation: (pages[pid].rotation + deg + 360) % 360,
          };
          return { ...f, pages };
        })
      );
    },
    []
  );

  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const arr = Array.from(fileList);
      const total = arr.length;
      setUploading(true);

      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        setUploadProgress({ done: i, total, filename: f.name });

        const fd = new FormData();
        fd.append("file", f);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data.error ||
                (res.status === 413
                  ? "File is too large. Maximum size is 100 MB."
                  : "Upload failed.")
            );
          }

          const uploaded: UploadedFile = {
            ...data,
            pages: data.thumbnails.map(() => ({ rotation: 0 })),
          };
          setFiles((prev) => [...prev, uploaded]);
          setQueue((prev) => [
            ...prev,
            ...data.thumbnails.map((_: string, idx: number) => ({
              file_id: data.file_id,
              page_index: idx,
            })),
          ]);
          setActiveId(data.file_id);
        } catch (e) {
          showToast(e instanceof Error ? e.message : String(e));
        }
        setUploadProgress({ done: i + 1, total, filename: "" });
      }

      setUploading(false);
    },
    [showToast]
  );

  const deleteFile = useCallback((fileId: string) => {
    setFiles((f) => f.filter((x) => x.file_id !== fileId));
    setQueue((q) => q.filter((x) => x.file_id !== fileId));
    setActiveId((id) => {
      const remaining = files.filter((x) => x.file_id !== fileId);
      return id === fileId
        ? remaining.length
          ? remaining[0].file_id
          : null
        : id;
    });
    showToast("File removed");
  }, [files, showToast]);

  const moveFileUp = useCallback((idx: number) => {
    if (idx <= 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveFileDown = useCallback((idx: number) => {
    setFiles((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (queue.length === 0) {
      showToast("No pages selected!");
      return;
    }
    setMerging(true);

    const payload = {
      pages: queue.map((q) => {
        const file = files.find((x) => x.file_id === q.file_id);
        const page = file?.pages[q.page_index];
        return {
          file_id: q.file_id,
          page_index: q.page_index,
          rotation: page?.rotation ?? 0,
        };
      }),
    };

    try {
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Merge failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dopeoffice_merged.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Download started!");
    } catch (e) {
      showToast(
        "Merge failed: " + (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setMerging(false);
    }
  }, [queue, files, showToast]);

  const selectAll = useCallback(() => {
    if (!activeId) return;
    const f = files.find((x) => x.file_id === activeId);
    if (!f) return;
    const toAdd = f.pages
      .map((_, i) => ({ file_id: f.file_id, page_index: i }))
      .filter(
        (item) =>
          !queue.some(
            (q) => q.file_id === item.file_id && q.page_index === item.page_index
          )
      );
    setQueue((prev) => [...prev, ...toAdd]);
  }, [activeId, files, queue]);

  const clearSelection = useCallback(() => setQueue([]), []);

  const { queueIndexByKey, selectedByFile } = buildQueueMeta();
  const activeFile = files.find((f) => f.file_id === activeId);
  const totalPages = files.reduce((a, b) => a + b.page_count, 0);

  return (
    <>
      <div className="site-bg">
        <div className="dot-pattern" aria-hidden />
      </div>

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
                <span className="stat-val">{queue.length}</span> selected
              </span>
            </nav>
            <button
              type="button"
              className="theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
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

      <main className="main-layout" id="main-layout">
        <aside className="left-panel" id="left-panel">
          <div className="panel-header">
            <h2 className="panel-title">Documents</h2>
          </div>
          <div
            className={`upload-zone ${uploading ? "uploading" : ""} ${draggedFileIdx === null ? "" : ""}`}
            onClick={() => document.getElementById("file-input")?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("dragover");
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("dragover");
              handleUpload(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              id="file-input"
              accept=".pdf,.docx"
              multiple
              hidden
              onChange={(e) => {
                handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="upload-visual" aria-hidden>
              {uploading ? (
                <div className="upload-spinner" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M20 8v24M8 20h24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <span className="upload-text" id="upload-text">
              {uploading && uploadProgress.filename
                ? `Uploading ${uploadProgress.filename}`
                : uploading
                  ? "Processing..."
                  : "Drop PDF or DOCX"}
            </span>
            <span className="upload-hint" id="upload-hint">
              {uploading
                ? `${uploadProgress.done}/${uploadProgress.total} files · ${uploadProgress.total > 0 ? Math.round((uploadProgress.done / uploadProgress.total) * 100) : 0}%`
                : "or click to browse"}
            </span>
          </div>
          <div
            className="file-list-container"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              document
                .querySelectorAll(".file-card.drag-over")
                .forEach((c) => c.classList.remove("drag-over"));
              if (draggedFileIdx === null) return;
              const card = (e.target as HTMLElement).closest(".file-card");
              const container = e.currentTarget;
              const cards = container.querySelectorAll(".file-card");
              const targetIdx = card
                ? Array.from(cards).indexOf(card as Element)
                : files.length;
              if (targetIdx >= 0 && targetIdx !== draggedFileIdx) {
                setFiles((prev) => {
                  const next = [...prev];
                  const [moved] = next.splice(draggedFileIdx, 1);
                  next.splice(Math.min(targetIdx, next.length), 0, moved);
                  return next;
                });
              }
              setDraggedFileIdx(null);
            }}
          >
            {files.map((f, i) => (
              <div
                key={f.file_id}
                className={`file-card ${activeId === f.file_id ? "active" : ""} ${draggedFileIdx === i ? "dragging" : ""}`}
                data-idx={i}
                onClick={() => setActiveId(f.file_id)}
                onDragEnter={(e) => {
                  if (draggedFileIdx !== null && draggedFileIdx !== i) {
                    e.currentTarget.classList.add("drag-over");
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    e.currentTarget.classList.remove("drag-over");
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("drag-over");
                  if (
                    draggedFileIdx === null ||
                    draggedFileIdx === i
                  )
                    return;
                  setFiles((prev) => {
                    const next = [...prev];
                    const [moved] = next.splice(draggedFileIdx, 1);
                    next.splice(i, 0, moved);
                    return next;
                  });
                  setDraggedFileIdx(null);
                }}
              >
                <div className="file-order-btns">
                  <button
                    type="button"
                    className="order-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFileUp(i);
                    }}
                    title="Move up"
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="order-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFileDown(i);
                    }}
                    title="Move down"
                    disabled={i === files.length - 1}
                  >
                    ↓
                  </button>
                </div>
                <div
                  className="file-drag-handle"
                  draggable
                  onDragStart={(e) => {
                    setDraggedFileIdx(i);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(i));
                    e.currentTarget.closest(".file-card")?.classList.add("dragging");
                  }}
                  onDragEnd={(e) => {
                    document
                      .querySelectorAll(".file-card.dragging, .file-card.drag-over")
                      .forEach((c) => c.classList.remove("dragging", "drag-over"));
                    setDraggedFileIdx(null);
                  }}
                >
                  ⋮⋮
                </div>
                <div className="file-icon">
                  {f.original_name.split(".").pop()?.toUpperCase()}
                </div>
                <div className="file-info">
                  <div className="file-name">{f.original_name}</div>
                  <div className="file-meta">
                    {selectedCountForFile(f.file_id)}/{f.page_count} selected
                  </div>
                </div>
                <button
                  type="button"
                  className="file-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(f.file_id);
                  }}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="merge-zone">
            <button
              type="button"
              className="merge-btn"
              disabled={queue.length === 0 || merging}
              onClick={handleMerge}
            >
              <span id="merge-btn-text">
                {merging ? "Processing..." : "Merge & Download"}
              </span>
              <svg
                className="btn-arrow"
                width="16"
                height="16"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9 3v12M4 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </aside>

        <section className="right-panel" id="right-panel">
          <div className="panel-header workspace-header">
            <div className="ws-title-block">
              <h2 className="panel-title ws-title" id="ws-title">
                {activeFile?.original_name ?? "Select a file"}
              </h2>
            </div>
            <div className="ws-actions">
              <button
                type="button"
                className={`ws-btn ${viewMode === "grid" ? "active" : ""}`}
                id="btn-view-grid"
                title="Grid view"
                onClick={() => setViewMode("grid")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="5.5"
                    height="5.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="9.5"
                    y="1"
                    width="5.5"
                    height="5.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="1"
                    y="9.5"
                    width="5.5"
                    height="5.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="9.5"
                    y="9.5"
                    width="5.5"
                    height="5.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                Grid
              </button>
              <button
                type="button"
                className={`ws-btn ${viewMode === "read" ? "active" : ""}`}
                id="btn-view-read"
                title="Read view"
                onClick={() => setViewMode("read")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="1.5"
                    width="14"
                    height="4.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <rect
                    x="1"
                    y="10"
                    width="14"
                    height="4.5"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                Read
              </button>
              <div className="ws-divider" />
              <button
                type="button"
                className="ws-btn"
                id="btn-sel-all"
                onClick={selectAll}
              >
                Select all
              </button>
              <button
                type="button"
                className="ws-btn"
                id="btn-clear"
                onClick={clearSelection}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="workspace-canvas" id="workspace-canvas">
            <div
              className="pages-grid"
              id="pages-grid"
              style={{ display: viewMode === "grid" ? "grid" : "none" }}
            >
              {activeFile?.thumbnails.map((src, i) => {
                const selected = isInQueue(activeFile.file_id, i);
                const qIdx = queueIndexByKey.get(
                  `${activeFile.file_id}:${i}`
                );
                const rot = activeFile.pages[i]?.rotation ?? 0;
                return (
                  <div
                    key={`${activeFile.file_id}-${i}`}
                    className={`page-card ${selected ? "selected" : ""} ${rot ? "rotated" : ""}`}
                    data-file-id={activeFile.file_id}
                    data-page-index={i}
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onClick={() => togglePage(activeFile.file_id, i)}
                    draggable
                    onDragStart={(e) => {
                      setDraggedPage({
                        fid: activeFile.file_id,
                        pid: i,
                      });
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData(
                        "text/plain",
                        `${activeFile.file_id}:${i}`
                      );
                      e.currentTarget.classList.add("dragging");
                    }}
                    onDragEnd={(e) => {
                      document
                        .querySelectorAll(
                          ".page-card.dragging, .page-card.drag-over"
                        )
                        .forEach((c) =>
                          c.classList.remove("dragging", "drag-over")
                        );
                      setDraggedPage(null);
                    }}
                    onDragEnter={(e) => {
                      if (
                        draggedPage &&
                        (draggedPage.fid !== activeFile.file_id ||
                          draggedPage.pid !== i)
                      ) {
                        e.currentTarget.classList.add("drag-over");
                      }
                    }}
                    onDragLeave={(e) => {
                      if (
                        !e.currentTarget.contains(e.relatedTarget as Node)
                      ) {
                        e.currentTarget.classList.remove("drag-over");
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      (e.dataTransfer as DataTransfer).dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.currentTarget.classList.remove("drag-over");
                      e.preventDefault();
                      if (!draggedPage) return;
                      const q1 = queue.findIndex(
                        (x) =>
                          x.file_id === draggedPage.fid &&
                          x.page_index === draggedPage.pid
                      );
                      const q2 = queue.findIndex(
                        (x) =>
                          x.file_id === activeFile.file_id &&
                          x.page_index === i
                      );
                      if (q1 > -1 && q2 > -1) {
                        setQueue((prev) => {
                          const next = [...prev];
                          const [item] = next.splice(q1, 1);
                          next.splice(q2, 0, item);
                          return next;
                        });
                      }
                      setDraggedPage(null);
                    }}
                  >
                    <div className="thumb-wrap">
                      <img
                        className="thumb-img"
                        src={src}
                        alt={`Page ${i + 1}`}
                        style={{
                          transform: `rotate(${rot}deg)`,
                        }}
                      />
                      <div className="rotation-badge">{rot}°</div>
                      <div className="page-controls">
                        <div
                          className="ctrl-btn"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            rotatePage(activeFile.file_id, i, -90);
                          }}
                          title="Rotate left"
                        >
                          ↺
                        </div>
                      </div>
                    </div>
                    <div className="page-num">Page {i + 1}</div>
                    {selected && qIdx && (
                      <div className="queue-badge">{qIdx}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={`pages-read-view ${viewMode === "read" ? "active" : ""}`}
              id="pages-read-view"
            >
              {activeFile?.thumbnails.map((src, i) => {
                const selected = isInQueue(activeFile.file_id, i);
                const qIdx = queueIndexByKey.get(
                  `${activeFile.file_id}:${i}`
                );
                const rot = activeFile.pages[i]?.rotation ?? 0;
                return (
                  <div
                    key={`read-${activeFile.file_id}-${i}`}
                    className={`read-page ${selected ? "selected" : ""} ${rot ? "rotated" : ""}`}
                    data-file-id={activeFile.file_id}
                    data-page-index={i}
                    onClick={() => togglePage(activeFile.file_id, i)}
                  >
                    <img
                      src={src}
                      alt={`Page ${i + 1}`}
                      style={{ transform: `rotate(${rot}deg)` }}
                    />
                    <div className="rotation-badge">{rot}°</div>
                    {selected && qIdx && (
                      <div className="queue-badge">{qIdx}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
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

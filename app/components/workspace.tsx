"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { buildQueueMeta, isInQueue } from "@/lib/utils";

export function Workspace() {
  const files = useAppStore((s) => s.files);
  const activeId = useAppStore((s) => s.activeId);
  const queue = useAppStore((s) => s.queue);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const togglePage = useAppStore((s) => s.togglePage);
  const selectAllPages = useAppStore((s) => s.selectAllPages);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const rotatePage = useAppStore((s) => s.rotatePage);
  const reorderQueue = useAppStore((s) => s.reorderQueue);

  const [draggedPage, setDraggedPage] = useState<{
    fid: string;
    pid: number;
  } | null>(null);

  const activeFile = files.find((f) => f.file_id === activeId);
  const { queueIndexByKey } = buildQueueMeta(queue);

  return (
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
            onClick={selectAllPages}
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
            const selected = isInQueue(queue, activeFile.file_id, i);
            const qIdx = queueIndexByKey.get(`${activeFile.file_id}:${i}`);
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
                  setDraggedPage({ fid: activeFile.file_id, pid: i });
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData(
                    "text/plain",
                    `${activeFile.file_id}:${i}`
                  );
                  e.currentTarget.classList.add("dragging");
                }}
                onDragEnd={() => {
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
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
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
                  const q = useAppStore.getState().queue;
                  const q1 = q.findIndex(
                    (x) =>
                      x.file_id === draggedPage.fid &&
                      x.page_index === draggedPage.pid
                  );
                  const q2 = q.findIndex(
                    (x) =>
                      x.file_id === activeFile.file_id &&
                      x.page_index === i
                  );
                  if (q1 > -1 && q2 > -1) {
                    reorderQueue(q1, q2);
                  }
                  setDraggedPage(null);
                }}
              >
                <div className="thumb-wrap">
                  <img
                    className="thumb-img"
                    src={src}
                    alt={`Page ${i + 1}`}
                    style={{ transform: `rotate(${rot}deg)` }}
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
            const selected = isInQueue(queue, activeFile.file_id, i);
            const qIdx = queueIndexByKey.get(`${activeFile.file_id}:${i}`);
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
  );
}

"use client";

import { useRef, useMemo, useCallback, memo } from "react";
import { useAppStore } from "@/lib/store";
import { buildQueueMeta } from "@/lib/utils";
import type { UploadedFile } from "@/lib/types";

/* ─── Individual page card (grid view) ─── */

interface PageCardProps {
  fileId: string;
  pageIndex: number;
  src: string;
  rotation: number;
  selected: boolean;
  queueIndex: number | undefined;
  onToggle: (fid: string, pid: number) => void;
  onRotate: (fid: string, pid: number, deg: number) => void;
  onDragStart: (fid: string, pid: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragEnter: (fid: string, pid: number, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (fid: string, pid: number, e: React.DragEvent) => void;
}

const GridPageCard = memo(function GridPageCard({
  fileId,
  pageIndex,
  src,
  rotation,
  selected,
  queueIndex,
  onToggle,
  onRotate,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop,
}: PageCardProps) {
  return (
    <div
      className={`page-card ${selected ? "selected" : ""} ${rotation ? "rotated" : ""}`}
      data-file-id={fileId}
      data-page-index={pageIndex}
      onClick={() => onToggle(fileId, pageIndex)}
      draggable
      onDragStart={(e) => onDragStart(fileId, pageIndex, e)}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => onDragEnter(fileId, pageIndex, e)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          e.currentTarget.classList.remove("drag-over");
        }
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(fileId, pageIndex, e)}
    >
      <div className="thumb-wrap">
        <img
          className="thumb-img"
          src={src}
          alt={`Page ${pageIndex + 1}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          loading="lazy"
          decoding="async"
        />
        <div className="rotation-badge">{rotation}°</div>
        <div className="page-controls">
          <div
            className="ctrl-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              onRotate(fileId, pageIndex, -90);
            }}
            title="Rotate left"
          >
            ↺
          </div>
        </div>
      </div>
      <div className="page-num">Page {pageIndex + 1}</div>
      {selected && queueIndex && (
        <div className="queue-badge">{queueIndex}</div>
      )}
    </div>
  );
});

/* ─── Individual page card (read view) ─── */

interface ReadPageCardProps {
  fileId: string;
  pageIndex: number;
  src: string;
  rotation: number;
  selected: boolean;
  queueIndex: number | undefined;
  onToggle: (fid: string, pid: number) => void;
}

const ReadPageCard = memo(function ReadPageCard({
  fileId,
  pageIndex,
  src,
  rotation,
  selected,
  queueIndex,
  onToggle,
}: ReadPageCardProps) {
  return (
    <div
      className={`read-page ${selected ? "selected" : ""} ${rotation ? "rotated" : ""}`}
      data-file-id={fileId}
      data-page-index={pageIndex}
      onClick={() => onToggle(fileId, pageIndex)}
    >
      <img
        src={src}
        alt={`Page ${pageIndex + 1}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        loading="lazy"
        decoding="async"
      />
      <div className="rotation-badge">{rotation}°</div>
      {selected && queueIndex && (
        <div className="queue-badge">{queueIndex}</div>
      )}
    </div>
  );
});

/* ─── Per-file grid container (memoized to skip hidden files) ─── */

interface FilePagesGridProps {
  file: UploadedFile;
  isActive: boolean;
  queueIndexByKey: Map<string, number>;
  onToggle: (fid: string, pid: number) => void;
  onRotate: (fid: string, pid: number, deg: number) => void;
  onDragStart: (fid: string, pid: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragEnter: (fid: string, pid: number, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (fid: string, pid: number, e: React.DragEvent) => void;
}

const FilePagesGrid = memo(
  function FilePagesGrid({
    file,
    isActive,
    queueIndexByKey,
    onToggle,
    onRotate,
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDrop,
  }: FilePagesGridProps) {
    return (
      <div
        className="pages-grid"
        style={{ display: isActive ? "grid" : "none" }}
      >
        {file.thumbnails.map((src, i) => {
          const selected = queueIndexByKey.has(`${file.file_id}:${i}`);
          const qIdx = queueIndexByKey.get(`${file.file_id}:${i}`);
          const rot = file.pages[i]?.rotation ?? 0;
          return (
            <GridPageCard
              key={`${file.file_id}-${i}`}
              fileId={file.file_id}
              pageIndex={i}
              src={src}
              rotation={rot}
              selected={selected}
              queueIndex={qIdx}
              onToggle={onToggle}
              onRotate={onRotate}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          );
        })}
      </div>
    );
  },
  (prev, next) => {
    // Hidden files: skip re-render unless file data itself changed
    if (!prev.isActive && !next.isActive) {
      return prev.file === next.file;
    }
    return false;
  }
);

/* ─── Per-file read container (memoized to skip hidden files) ─── */

interface FilePagesReadProps {
  file: UploadedFile;
  isActive: boolean;
  queueIndexByKey: Map<string, number>;
  onToggle: (fid: string, pid: number) => void;
}

const FilePagesRead = memo(
  function FilePagesRead({
    file,
    isActive,
    queueIndexByKey,
    onToggle,
  }: FilePagesReadProps) {
    return (
      <div className={`pages-read-view ${isActive ? "active" : ""}`}>
        {file.thumbnails.map((src, i) => {
          const selected = queueIndexByKey.has(`${file.file_id}:${i}`);
          const qIdx = queueIndexByKey.get(`${file.file_id}:${i}`);
          const rot = file.pages[i]?.rotation ?? 0;
          return (
            <ReadPageCard
              key={`read-${file.file_id}-${i}`}
              fileId={file.file_id}
              pageIndex={i}
              src={src}
              rotation={rot}
              selected={selected}
              queueIndex={qIdx}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    );
  },
  (prev, next) => {
    if (!prev.isActive && !next.isActive) {
      return prev.file === next.file;
    }
    return false;
  }
);

/* ─── Main workspace ─── */

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

  const activeFile = files.find((f) => f.file_id === activeId);
  const { queueIndexByKey } = useMemo(() => buildQueueMeta(queue), [queue]);

  // Use a ref so the drop handler stays stable across renders
  const draggedPageRef = useRef<{ fid: string; pid: number } | null>(null);

  const handleDragStart = useCallback(
    (fid: string, pid: number, e: React.DragEvent) => {
      draggedPageRef.current = { fid, pid };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `${fid}:${pid}`);
      (e.target as HTMLElement).closest(".page-card")?.classList.add("dragging");
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    document
      .querySelectorAll(".page-card.dragging, .page-card.drag-over")
      .forEach((c) => c.classList.remove("dragging", "drag-over"));
    draggedPageRef.current = null;
  }, []);

  const handleDragEnter = useCallback(
    (_fid: string, _pid: number, e: React.DragEvent) => {
      e.currentTarget.classList.add("drag-over");
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (fid: string, pid: number, e: React.DragEvent) => {
      e.currentTarget.classList.remove("drag-over");
      e.preventDefault();
      const dp = draggedPageRef.current;
      if (!dp) return;
      const q = useAppStore.getState().queue;
      const q1 = q.findIndex(
        (x) => x.file_id === dp.fid && x.page_index === dp.pid
      );
      const q2 = q.findIndex(
        (x) => x.file_id === fid && x.page_index === pid
      );
      if (q1 > -1 && q2 > -1) {
        reorderQueue(q1, q2);
      }
      draggedPageRef.current = null;
    },
    [reorderQueue]
  );

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
        {activeFile && viewMode === "grid" && (
          <FilePagesGrid
            key={`grid-${activeFile.file_id}`}
            file={activeFile}
            isActive
            queueIndexByKey={queueIndexByKey}
            onToggle={togglePage}
            onRotate={rotatePage}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        )}

        {activeFile && viewMode === "read" && (
          <FilePagesRead
            key={`read-${activeFile.file_id}`}
            file={activeFile}
            isActive
            queueIndexByKey={queueIndexByKey}
            onToggle={togglePage}
          />
        )}
      </div>
    </section>
  );
}

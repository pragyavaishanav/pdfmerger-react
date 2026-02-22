"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useAppStore } from "@/lib/store";
import { getFileExtension } from "@/lib/utils";
import type { UploadedFile, QueueItem } from "@/lib/types";
import { ArrowDown, ArrowUp, Download, Plus } from "lucide-react";

interface FileCardProps {
  file: UploadedFile;
  index: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  isMovingUp: boolean;
  isMovingDown: boolean;
  selectedCount: number;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  // onDragHandleStart: (idx: number, e: React.DragEvent) => void;
  // onDragHandleEnd: () => void;
}

const FileCard = memo(function FileCard({
  file,
  index,
  isActive,
  isFirst,
  isLast,
  isMovingUp,
  isMovingDown,
  selectedCount,
  isDragging,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  // onDragHandleStart,
  // onDragHandleEnd,
}: FileCardProps) {
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div
      className={`file-card ${isActive ? "active" : ""} ${isDragging ? "dragging" : ""}`}
      data-idx={index}
      onClick={() => onSelect(file.file_id)}
      onDragEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.classList.add("drag-over");
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          e.currentTarget.classList.remove("drag-over");
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="file-order-btns">
        <button
          type="button"
          className={`order-btn ${isMovingUp ? "loading" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(index);
          }}
          title="Move up"
          disabled={isFirst || isMovingUp || isMovingDown}
        >
          {isMovingUp ? <span className="inline-spinner" aria-hidden /> : <ArrowUp className="size-2" />}
        </button>
        <button
          type="button"
          className={`order-btn ${isMovingDown ? "loading" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(index);
          }}
          title="Move down"
          disabled={isLast || isMovingUp || isMovingDown}
        >
          {isMovingDown ? <span className="inline-spinner" aria-hidden /> : <ArrowDown className="size-2" />}
        </button>
      </div>
      {/* <div
        className="file-drag-handle"
        draggable
        onDragStart={(e) => onDragHandleStart(index, e)}
        onDragEnd={onDragHandleEnd}
      >
        ⋮⋮
      </div> */}
      <div className="file-icon">{getFileExtension(file.original_name)}</div>
      <div className="file-info">
        <div className="file-name">{file.original_name}</div>
        <div className="file-meta">
          {selectedCount}/{file.page_count} selected
        </div>
      </div>
      <button
        type="button"
        className="file-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file.file_id);
          showToast("File removed");
        }}
        title="Remove file"
      >
        ×
      </button>
    </div>
  );
});

function buildSelectedCountMap(queue: QueueItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const q of queue) {
    map.set(q.file_id, (map.get(q.file_id) || 0) + 1);
  }
  return map;
}

export function Sidebar() {
  const files = useAppStore((s) => s.files);
  const activeId = useAppStore((s) => s.activeId);
  const queue = useAppStore((s) => s.queue);
  const removeFile = useAppStore((s) => s.removeFile);
  const reorderFiles = useAppStore((s) => s.reorderFiles);
  const moveFileUp = useAppStore((s) => s.moveFileUp);
  const moveFileDown = useAppStore((s) => s.moveFileDown);
  const setActiveId = useAppStore((s) => s.setActiveId);
  // const showToast = useAppStore((s) => s.showToast);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    done: 0,
    total: 0,
    filename: "",
  });
  const [merging, setMerging] = useState(false);
  const [draggedFileIdx, setDraggedFileIdx] = useState<number | null>(null);
  const [moving, setMoving] = useState<{ idx: number; dir: "up" | "down" } | null>(
    null
  );

  const selectedCountMap = useMemo(() => buildSelectedCountMap(queue), [queue]);

  const handleUpload = useCallback(async (fileList: FileList | null) => {
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
        const pages = data.thumbnails.map((_: string, idx: number) => ({
          file_id: data.file_id,
          page_index: idx,
        }));
        useAppStore.getState().addFile(uploaded, pages);
      } catch (e) {
        useAppStore
          .getState()
          .showToast(e instanceof Error ? e.message : String(e));
      }
      setUploadProgress({ done: i + 1, total, filename: "" });
    }

    setUploading(false);
  }, []);

  const handleMerge = useCallback(async () => {
    const { queue, files, showToast } = useAppStore.getState();
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
  }, []);

  // const handleDragHandleStart = useCallback(
  //   (idx: number, e: React.DragEvent) => {
  //     setDraggedFileIdx(idx);
  //     e.dataTransfer.effectAllowed = "move";
  //     e.dataTransfer.setData("text/plain", String(idx));
  //     (e.target as HTMLElement)
  //       .closest(".file-card")
  //       ?.classList.add("dragging");
  //   },
  //   []
  // );

  // const handleDragHandleEnd = useCallback(() => {
  //   document
  //     .querySelectorAll(".file-card.dragging, .file-card.drag-over")
  //     .forEach((c) => c.classList.remove("dragging", "drag-over"));
  //   setDraggedFileIdx(null);
  // }, []);

  const handleMoveUp = useCallback(
    (idx: number) => {
      setMoving({ idx, dir: "up" });
      moveFileUp(idx);
      setTimeout(() => setMoving(null), 180);
    },
    [moveFileUp]
  );

  const handleMoveDown = useCallback(
    (idx: number) => {
      setMoving({ idx, dir: "down" });
      moveFileDown(idx);
      setTimeout(() => setMoving(null), 180);
    },
    [moveFileDown]
  );

  return (
    <aside className="left-panel" id="left-panel">
      {/* <div className="panel-header">
        <h2 className="panel-title">Documents</h2>
      </div> */}
      <div
        className={`upload-zone ${uploading ? "uploading" : ""}`}
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
            <Plus className="size-6" />
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
            reorderFiles(draggedFileIdx, targetIdx);
          }
          setDraggedFileIdx(null);
        }}
      >
        {files.map((f, i) => (
          <FileCard
            key={f.file_id}
            file={f}
            index={i}
            isActive={activeId === f.file_id}
            isFirst={i === 0}
            isLast={i === files.length - 1}
            isMovingUp={moving?.idx === i && moving.dir === "up"}
            isMovingDown={moving?.idx === i && moving.dir === "down"}
            selectedCount={selectedCountMap.get(f.file_id) ?? 0}
            isDragging={draggedFileIdx === i}
            onSelect={setActiveId}
            onRemove={removeFile}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            // onDragHandleStart={handleDragHandleStart}
            // onDragHandleEnd={handleDragHandleEnd}
          />
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
            {merging ? "Processing..." : `Merge PDF (${queue.length})`}
          </span>
          {/* <svg
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
          </svg> */}
          <Download className="size-4" />
        </button>
      </div>
    </aside>
  );
}

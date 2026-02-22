import { create } from "zustand";
import type { UploadedFile, QueueItem } from "@/lib/types";

interface AppState {
  files: UploadedFile[];
  activeId: string | null;
  queue: QueueItem[];
  theme: "light" | "dark";
  viewMode: "grid" | "read";
  toast: { msg: string; show: boolean };
}

interface AppActions {
  addFile: (file: UploadedFile, pages: QueueItem[]) => void;
  removeFile: (fileId: string) => void;
  reorderFiles: (fromIdx: number, toIdx: number) => void;
  moveFileUp: (idx: number) => void;
  moveFileDown: (idx: number) => void;
  rotatePage: (fid: string, pid: number, deg: number) => void;
  setActiveId: (id: string | null) => void;
  togglePage: (fid: string, pid: number) => void;
  selectAllPages: () => void;
  clearSelection: () => void;
  reorderQueue: (fromIdx: number, toIdx: number) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setViewMode: (mode: "grid" | "read") => void;
  showToast: (msg: string) => void;
}

export type AppStore = AppState & AppActions;

function sortQueueByFileOrder(queue: QueueItem[], files: UploadedFile[]): QueueItem[] {
  const fileOrder = new Map(files.map((f, i) => [f.file_id, i]));
  return [...queue].sort((a, b) => {
    const fa = fileOrder.get(a.file_id) ?? 0;
    const fb = fileOrder.get(b.file_id) ?? 0;
    if (fa !== fb) return fa - fb;
    return a.page_index - b.page_index;
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  files: [],
  activeId: null,
  queue: [],
  theme: "dark",
  viewMode: "grid",
  toast: { msg: "", show: false },

  addFile: (file, pages) =>
    set((s) => ({
      files: [...s.files, file],
      queue: [...s.queue, ...pages],
      activeId: file.file_id,
    })),

  removeFile: (fileId) =>
    set((s) => {
      const remaining = s.files.filter((f) => f.file_id !== fileId);
      return {
        files: remaining,
        queue: s.queue.filter((q) => q.file_id !== fileId),
        activeId:
          s.activeId === fileId
            ? remaining.length
              ? remaining[0].file_id
              : null
            : s.activeId,
      };
    }),

  reorderFiles: (fromIdx, toIdx) =>
    set((s) => {
      const next = [...s.files];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(Math.min(toIdx, next.length), 0, moved);
      return { files: next, queue: sortQueueByFileOrder(s.queue, next) };
    }),

  moveFileUp: (idx) => {
    if (idx <= 0) return;
    set((s) => {
      const next = [...s.files];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { files: next, queue: sortQueueByFileOrder(s.queue, next) };
    });
  },

  moveFileDown: (idx) => {
    set((s) => {
      if (idx >= s.files.length - 1) return s;
      const next = [...s.files];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { files: next, queue: sortQueueByFileOrder(s.queue, next) };
    });
  },

  rotatePage: (fid, pid, deg) =>
    set((s) => ({
      files: s.files.map((f) => {
        if (f.file_id !== fid) return f;
        const pages = [...f.pages];
        pages[pid] = { rotation: (pages[pid].rotation + deg + 360) % 360 };
        return { ...f, pages };
      }),
    })),

  setActiveId: (id) => set({ activeId: id }),

  togglePage: (fid, pid) => {
    const { queue, files } = get();
    const idx = queue.findIndex(
      (q) => q.file_id === fid && q.page_index === pid
    );
    if (idx > -1) {
      set({ queue: queue.filter((_, i) => i !== idx) });
    } else {
      const fileIdx = files.findIndex((f) => f.file_id === fid);
      let insertAt = queue.length;
      for (let i = queue.length - 1; i >= 0; i--) {
        const qi = files.findIndex((f) => f.file_id === queue[i].file_id);
        if (qi < fileIdx || (qi === fileIdx && queue[i].page_index < pid)) {
          insertAt = i + 1;
          break;
        }
        if (i === 0) insertAt = 0;
      }
      const next = [...queue];
      next.splice(insertAt, 0, { file_id: fid, page_index: pid });
      set({ queue: next });
    }
  },

  selectAllPages: () => {
    const { activeId, files, queue } = get();
    if (!activeId) return;
    const f = files.find((x) => x.file_id === activeId);
    if (!f) return;
    const toAdd = f.pages
      .map((_, i) => ({ file_id: f.file_id, page_index: i }))
      .filter(
        (item) =>
          !queue.some(
            (q) =>
              q.file_id === item.file_id && q.page_index === item.page_index
          )
      );
    set({ queue: [...queue, ...toAdd] });
  },

  clearSelection: () => set({ queue: [] }),

  reorderQueue: (fromIdx, toIdx) =>
    set((s) => {
      const next = [...s.queue];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return { queue: next };
    }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

  setViewMode: (mode) => set({ viewMode: mode }),

  showToast: (msg) => {
    set({ toast: { msg, show: true } });
    setTimeout(() => set({ toast: { msg: "", show: false } }), 3000);
  },
}));

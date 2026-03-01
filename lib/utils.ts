import type { QueueItem } from "@/lib/types";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function buildQueueMeta(queue: QueueItem[]) {
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
}

export function selectedCountForFile(queue: QueueItem[], fid: string) {
  return queue.filter((q) => q.file_id === fid).length;
}

export function isInQueue(queue: QueueItem[], fid: string, pid: number) {
  return queue.some((q) => q.file_id === fid && q.page_index === pid);
}

export function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toUpperCase() ?? "";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

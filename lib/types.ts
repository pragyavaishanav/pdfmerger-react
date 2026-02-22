export interface UploadedFile {
  file_id: string;
  original_name: string;
  page_count: number;
  thumbnails: string[];
  pages: { rotation: number }[];
}

export interface QueueItem {
  file_id: string;
  page_index: number;
}

export interface MergePayload {
  pages: {
    file_id: string;
    page_index: number;
    rotation: number;
  }[];
}

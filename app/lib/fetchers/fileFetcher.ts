export type FileSource =
  | { type: "local"; fileList: FileList }
  | { type: "drive-open" | "drive-picker"; fileIds: string[]; accessToken: string };

export async function fetchFileBuffers(
  source: FileSource
): Promise<{ name: string; arrayBuffer: ArrayBuffer; size: number; fileId?: string }[]> {
  if (source.type === "local") {
    return Promise.all(
      Array.from(source.fileList).map(async (f) => ({
        name: f.name,
        arrayBuffer: await f.arrayBuffer(),
        size: f.size,
        fileId: undefined,
      }))
    );
  }

  const { fileIds, accessToken } = source;

  return Promise.all(
    fileIds.map(async (id) => {
      const res = await fetch(
        `/api/drive/file?fileId=${encodeURIComponent(id)}&accessToken=${encodeURIComponent(accessToken)}`
      );

      if (!res.ok) {
        throw new Error("Access expired. Please reopen this file from Google Drive.");
      }

      const contentLength = Number(res.headers.get("Content-Length") ?? 0);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
      }

      const combined = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        combined.set(chunk, position);
        position += chunk.length;
      }

      const name =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "unknown";

      return {
        name,
        size: contentLength || receivedLength,
        fileId: id,
        arrayBuffer: combined.buffer as ArrayBuffer,
      };
    })
  );
}

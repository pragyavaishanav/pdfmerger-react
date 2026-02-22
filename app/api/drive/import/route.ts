export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const { fileId, accessToken } = await req.json();

    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: "Missing fileId or accessToken" },
        { status: 400 }
      );
    }

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=name,mimeType`,
      { headers: authHeader }
    );

    if (!metaRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file metadata from Google Drive" },
        { status: metaRes.status }
      );
    }

    const meta = await metaRes.json();
    let fileName: string = meta.name || "drive_file.pdf";

    let fileBlob: Blob;

    if (meta.mimeType?.startsWith("application/vnd.google-apps.")) {
      const exportRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=application/pdf`,
        { headers: authHeader }
      );

      if (!exportRes.ok) {
        return NextResponse.json(
          { error: "Failed to export Google Workspace file as PDF" },
          { status: exportRes.status }
        );
      }

      fileBlob = await exportRes.blob();

      if (!fileName.toLowerCase().endsWith(".pdf")) {
        fileName += ".pdf";
      }
    } else {
      const contentRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
        { headers: authHeader }
      );

      if (!contentRes.ok) {
        return NextResponse.json(
          { error: "Failed to download file from Google Drive" },
          { status: contentRes.status }
        );
      }

      fileBlob = await contentRes.blob();
    }

    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    const uploadRes = await fetch(`${PYTHON_BACKEND}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: data.error || "Backend processing failed" },
        { status: uploadRes.status }
      );
    }

    return NextResponse.json({
      ...data,
      original_name: fileName,
    });
  } catch (error) {
    console.error("Drive import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import file from Google Drive",
      },
      { status: 500 }
    );
  }
}

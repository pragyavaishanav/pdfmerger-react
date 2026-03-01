export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const { fileId, accessToken, fileName } = await req.json();

    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: "Missing fileId or accessToken" },
        { status: 400 }
      );
    }

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    let name = fileName;
    if (!name) {
      const metaRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(fileId)}?$select=name`,
        { headers: authHeader }
      );
      if (metaRes.ok) {
        const meta = await metaRes.json();
        name = meta.name;
      }
    }
    name = name || "onedrive_file.pdf";

    console.log(`[OneDrive] Downloading file: ${name} (${fileId})`);

    const contentRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(fileId)}/content`,
      { headers: authHeader, redirect: "follow" }
    );

    if (!contentRes.ok) {
      const errText = await contentRes.text();
      console.error("[OneDrive] Download failed:", contentRes.status, errText);
      return NextResponse.json(
        { error: "Failed to download file from OneDrive" },
        { status: contentRes.status }
      );
    }

    const buffer = Buffer.from(await contentRes.arrayBuffer());
    console.log(`[OneDrive] Downloaded ${buffer.length} bytes`);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Downloaded file is empty" },
        { status: 400 }
      );
    }

    const fileBlob = new Blob([buffer], { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", fileBlob, name);

    console.log(`[OneDrive] Uploading to backend: ${PYTHON_BACKEND}/upload`);

    const uploadRes = await fetch(`${PYTHON_BACKEND}/upload`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(120_000),
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("[OneDrive] Backend upload failed:", data);
      return NextResponse.json(
        { error: data.error || "Backend processing failed" },
        { status: uploadRes.status }
      );
    }

    console.log(`[OneDrive] Import complete: ${name} → ${data.file_id}`);

    return NextResponse.json({
      ...data,
      original_name: name,
    });
  } catch (error) {
    console.error("[OneDrive] Fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import file from OneDrive",
      },
      { status: 500 }
    );
  }
}

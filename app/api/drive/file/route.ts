export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");
  const accessToken = searchParams.get("accessToken");

  if (!fileId || !accessToken) {
    return NextResponse.json(
      { error: "Missing fileId or accessToken" },
      { status: 400 }
    );
  }

  const driveHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  const rangeHeader = req.headers.get("Range");
  if (rangeHeader) {
    driveHeaders["Range"] = rangeHeader;
  }

  const dataRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: driveHeaders }
  );

  if (!dataRes.ok || !dataRes.body) {
    return NextResponse.json(
      { error: "Failed to fetch file from Google Drive" },
      { status: dataRes.status }
    );
  }

  const responseHeaders: Record<string, string> = {
    "Content-Type":
    dataRes.headers.get("Content-Type") || "application/octet-stream",
    "Accept-Ranges": "bytes",
  };

  const contentLength = dataRes.headers.get("Content-Length");
  if (contentLength) {
    responseHeaders["Content-Length"] = contentLength;
  }

  const contentRange = dataRes.headers.get("Content-Range");
  if (contentRange) {
    responseHeaders["Content-Range"] = contentRange;
  }

  return new NextResponse(dataRes.body, {
    status: dataRes.status,
    headers: responseHeaders,
  });
}

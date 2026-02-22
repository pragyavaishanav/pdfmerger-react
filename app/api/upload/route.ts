import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${PYTHON_BACKEND}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Upload failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to backend. Ensure the Python server is running on port 8080.",
      },
      { status: 500 }
    );
  }
}

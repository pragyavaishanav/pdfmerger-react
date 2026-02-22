import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${PYTHON_BACKEND}/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      let error: string;
      try {
        const json = JSON.parse(text);
        error = json.error || text;
      } catch {
        error = text;
      }
      return NextResponse.json({ error }, { status: res.status });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="dopeoffice_merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge proxy error:", error);
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

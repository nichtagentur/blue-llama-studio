import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "Missing uri parameter" }, { status: 400 });
  }

  try {
    const fetchUrl = uri.includes("?")
      ? `${uri}&key=${process.env.GEMINI_API_KEY}`
      : `${uri}?key=${process.env.GEMINI_API_KEY}`;

    // First request may return a redirect - follow it manually
    let res = await fetch(fetchUrl, { redirect: "follow" });

    // If we get a small JSON error response, try the /download/ path variant
    if (!res.ok || res.headers.get("content-type")?.includes("json")) {
      const downloadUrl = fetchUrl.replace(
        "/v1beta/files/",
        "/download/v1beta/files/"
      );
      res = await fetch(downloadUrl, { redirect: "follow" });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "video/mp4";
    const body = res.body;

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'inline; filename="blue-llama-video.mp4"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

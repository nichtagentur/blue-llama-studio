import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "Missing uri parameter" }, { status: 400 });
  }

  try {
    // Veo returns URIs that may need the API key to access
    const fetchUrl = uri.includes("?")
      ? `${uri}&key=${process.env.GEMINI_API_KEY}`
      : `${uri}?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(fetchUrl);

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

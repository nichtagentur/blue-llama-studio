import { NextResponse } from "next/server";
import { pollStatus } from "@/lib/veo";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const operationName = searchParams.get("op");

  if (!operationName) {
    return NextResponse.json({ error: "Missing op parameter" }, { status: 400 });
  }

  try {
    const result = await pollStatus(operationName);

    if (result.done && result.videoUri) {
      return NextResponse.json({
        status: "completed",
        videoUrl: `/api/download?uri=${encodeURIComponent(result.videoUri)}`,
      });
    }

    return NextResponse.json({ status: "processing" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, status: "failed" }, { status: 500 });
  }
}

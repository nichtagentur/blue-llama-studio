import { NextResponse } from "next/server";
import { startGeneration } from "@/lib/veo";
import { injectBlueLlama } from "@/lib/prompt";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const fullPrompt = injectBlueLlama(prompt);
    const operationName = await startGeneration(fullPrompt, aspectRatio || "16:9");

    return NextResponse.json({ operationName, prompt: fullPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

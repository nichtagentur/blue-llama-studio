"use client";

import { useState, useRef, useCallback } from "react";
import PromptForm from "@/components/PromptForm";
import VideoPlayer from "@/components/VideoPlayer";
import VideoEditor from "@/components/VideoEditor";
import ShareButtons from "@/components/ShareButtons";

type Status = "idle" | "generating" | "completed" | "error";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleGenerate = useCallback(async (prompt: string, aspectRatio: string) => {
    setStatus("generating");
    setError(null);
    setVideoUrl(null);
    setStatusMessage("Starting video generation...");

    try {
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Failed to start generation");

      const operationName = genData.operationName;
      setStatusMessage("Generating your blue llama video... This takes 30-60 seconds.");

      // Poll for completion
      const poll = async (): Promise<string> => {
        const res = await fetch(`/api/status?op=${encodeURIComponent(operationName)}`);
        const data = await res.json();

        if (data.status === "completed" && data.videoUrl) {
          return data.videoUrl;
        }

        if (data.status === "failed" || data.error) {
          throw new Error(data.error || "Generation failed");
        }

        // Wait 5 seconds and poll again
        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      };

      const url = await poll();
      setVideoUrl(url);
      setStatus("completed");
      setStatusMessage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStatus("error");
      setStatusMessage("");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <svg width="40" height="40" viewBox="0 0 100 100" className="flex-shrink-0">
            <ellipse cx="50" cy="65" rx="25" ry="30" fill="#3B82F6" />
            <circle cx="50" cy="30" r="18" fill="#60A5FA" />
            <circle cx="43" cy="26" r="3" fill="white" />
            <circle cx="57" cy="26" r="3" fill="white" />
            <circle cx="43" cy="26" r="1.5" fill="#1E293B" />
            <circle cx="57" cy="26" r="1.5" fill="#1E293B" />
            <ellipse cx="50" cy="34" rx="4" ry="2" fill="#2563EB" />
            <ellipse cx="30" cy="18" rx="4" ry="12" fill="#60A5FA" transform="rotate(-15 30 18)" />
            <ellipse cx="70" cy="18" rx="4" ry="12" fill="#60A5FA" transform="rotate(15 70 18)" />
            <rect x="42" y="90" width="6" height="10" rx="2" fill="#2563EB" />
            <rect x="52" y="90" width="6" height="10" rx="2" fill="#2563EB" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-white">Blue Llama Studio</h1>
            <p className="text-sm text-blue-300">AI Video Editor -- Every video features a blue llama</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Prompt input */}
        <PromptForm onGenerate={handleGenerate} isGenerating={status === "generating"} />

        {/* Status indicator */}
        {status === "generating" && (
          <div className="flex items-center gap-4 rounded-xl border border-blue-500/30 bg-blue-950/50 p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <div>
              <p className="text-lg font-medium text-white">{statusMessage}</p>
              <p className="text-sm text-slate-400">Powered by Google Veo 3.1</p>
            </div>
          </div>
        )}

        {/* Error display */}
        {status === "error" && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6">
            <p className="font-medium text-red-300">Generation failed</p>
            <p className="mt-1 text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Video player + editor + share */}
        {videoUrl && status === "completed" && (
          <div className="space-y-6">
            <VideoPlayer
              ref={videoRef}
              videoUrl={videoUrl}
              onLoadedMetadata={(d) => setDuration(d)}
            />
            {duration > 0 && (
              <VideoEditor
                videoRef={videoRef}
                duration={duration}
                videoUrl={videoUrl}
              />
            )}
            <ShareButtons videoUrl={videoUrl} />
          </div>
        )}

        {/* Empty state */}
        {status === "idle" && (
          <div className="py-16 text-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto mb-4 opacity-30">
              <ellipse cx="50" cy="65" rx="25" ry="30" fill="#3B82F6" />
              <circle cx="50" cy="30" r="18" fill="#60A5FA" />
              <circle cx="43" cy="26" r="3" fill="white" />
              <circle cx="57" cy="26" r="3" fill="white" />
              <ellipse cx="30" cy="18" rx="4" ry="12" fill="#60A5FA" transform="rotate(-15 30 18)" />
              <ellipse cx="70" cy="18" rx="4" ry="12" fill="#60A5FA" transform="rotate(15 70 18)" />
            </svg>
            <p className="text-lg text-slate-500">Enter an idea above to generate your first blue llama video</p>
          </div>
        )}
      </main>
    </div>
  );
}

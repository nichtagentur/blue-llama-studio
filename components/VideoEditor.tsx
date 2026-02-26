"use client";

import { useRef, useState, useCallback } from "react";

interface VideoEditorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  duration: number;
  videoUrl: string;
}

export default function VideoEditor({ videoRef, duration, videoUrl }: VideoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(duration);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [isExporting, setIsExporting] = useState(false);

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const handlePreviewTrim = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = trimStart;
    videoRef.current.play();

    const checkTime = () => {
      if (!videoRef.current) return;
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.pause();
        return;
      }
      requestAnimationFrame(checkTime);
    };
    requestAnimationFrame(checkTime);
  }, [videoRef, trimStart, trimEnd]);

  const handleExport = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsExporting(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    video.currentTime = trimStart;
    video.muted = false;

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    const stream = canvas.captureStream(30);

    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      // Video may not have audio - that's fine
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    const exportDone = new Promise<void>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "blue-llama-video.webm";
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        resolve();
      };
    });

    recorder.start();
    await video.play();

    const textYPositions = { top: 60, center: canvas.height / 2, bottom: canvas.height - 40 };

    const drawFrame = () => {
      if (!video || video.currentTime >= trimEnd || video.paused) {
        recorder.stop();
        video.pause();
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (overlayText) {
        const fontSize = Math.round(canvas.width / 20);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeText(overlayText, canvas.width / 2, textYPositions[textPosition]);
        ctx.fillStyle = "white";
        ctx.fillText(overlayText, canvas.width / 2, textYPositions[textPosition]);
      }
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);
    await exportDone;
  }, [videoRef, trimStart, trimEnd, overlayText, textPosition]);

  const handleDownloadOriginal = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "blue-llama-video.mp4";
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Trim controls */}
      <div className="rounded-xl border border-blue-500/20 bg-slate-800/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Trim Video</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-400">Start: {formatTime(trimStart)}</label>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimStart}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setTrimStart(Math.min(v, trimEnd - 0.5));
              }}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-400">End: {formatTime(trimEnd)}</label>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimEnd}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setTrimEnd(Math.max(v, trimStart + 0.5));
              }}
              className="w-full accent-blue-500"
            />
          </div>
          <button
            onClick={handlePreviewTrim}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Text overlay controls */}
      <div className="rounded-xl border border-blue-500/20 bg-slate-800/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Text Overlay</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Add text to your video..."
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            className="flex-1 rounded-lg border border-blue-500/30 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
          />
          <select
            value={textPosition}
            onChange={(e) => setTextPosition(e.target.value as "top" | "center" | "bottom")}
            className="rounded-lg border border-blue-500/30 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadOriginal}
          className="flex-1 rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600 transition-colors"
        >
          Download Original
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? "Exporting..." : "Export Edited Video"}
        </button>
      </div>
    </div>
  );
}

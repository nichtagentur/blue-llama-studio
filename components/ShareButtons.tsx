"use client";

interface ShareButtonsProps {
  videoUrl: string;
}

export default function ShareButtons({ videoUrl }: ShareButtonsProps) {
  const shareText = "Check out this video I made with Blue Llama Studio! #BlueLlama #AI";

  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareText);
    alert("Share text copied to clipboard! Paste it when uploading your video.");
  };

  const handleDownloadForPlatform = (platform: string) => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `blue-llama-${platform}.mp4`;
    a.click();
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Share on Social Media</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={handleShareX}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Share on X
        </button>
        <button
          onClick={() => handleDownloadForPlatform("tiktok")}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          TikTok
        </button>
        <button
          onClick={() => handleDownloadForPlatform("instagram")}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Instagram
        </button>
        <button
          onClick={() => handleDownloadForPlatform("youtube")}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          YouTube
        </button>
      </div>
      <button
        onClick={handleCopyLink}
        className="w-full rounded-xl border border-blue-500/30 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
      >
        Copy Share Text to Clipboard
      </button>
    </div>
  );
}

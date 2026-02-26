"use client";

import { forwardRef } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  onLoadedMetadata?: (duration: number) => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, onLoadedMetadata }, ref) => {
    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-blue-500/20 bg-black">
        <video
          ref={ref}
          src={videoUrl}
          controls
          className="w-full"
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            onLoadedMetadata?.(video.duration);
          }}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;

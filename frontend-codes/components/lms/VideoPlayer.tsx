
import React, { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, onMouseEnter, onMouseLeave }, ref) => {
    return (
      <video
        ref={ref}
        className="w-full h-full object-contain"
        src={src}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        preload="metadata"
       
        autoPlay
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize 
} from 'lucide-react';
import { VideoSettingsMenu } from '@/components/lms/VideoSettingsMenu';
import { CaptionsToggle } from '@/components/lms/CaptionsToggle';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  videoQuality: string;
  captionsEnabled: boolean;
  availableQualities: string[];
  showControls: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onQualityChange: (quality: string) => void;
  onToggleCaptions: () => void;
  onToggleFullscreen: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  videoQuality,
  captionsEnabled,
  availableQualities,
  showControls,
  onTogglePlay,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onQualityChange,
  onToggleCaptions,
  onToggleFullscreen
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onSeek(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressClick(e);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      {/* Play/Pause overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          size="lg"
          variant="ghost"
          className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
        </Button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        {/* Progress bar */}
        <div className="flex items-center space-x-3 text-white text-sm">
          <span className="min-w-[50px] text-center">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressMouseMove}
            onMouseUp={handleProgressMouseUp}
            onMouseLeave={handleProgressMouseUp}
          >
            <div 
              className="h-full bg-[#fdb606] rounded-full relative transition-all duration-150"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#fdb606] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
            </div>
          </div>
          <span className="min-w-[50px] text-center">{formatTime(duration)}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2 transition-colors"
              onClick={onSkipBackward}
              title="Skip backward 10s"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2 transition-colors" 
              onClick={onTogglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2 transition-colors"
              onClick={onSkipForward}
              title="Skip forward 10s"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            {/* Volume Control */}
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-2 transition-colors" 
                onClick={onToggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-3 bg-black/90 rounded-lg backdrop-blur-sm border border-gray-600 z-50">
                  <div className="h-20 flex items-center">
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(value) => onVolumeChange(value[0] / 100)}
                      max={100}
                      step={1}
                      className="w-6 [&_.bg-primary]:bg-[#fdb606] [&_.border-primary]:border-[#fdb606]"
                      orientation="vertical"
                    />
                  </div>
                  <div className="text-xs text-center text-white mt-2">
                    {Math.round(volume * 100)}%
                  </div>
                </div>
              )}
            </div>
            
            <span className="text-xs text-gray-300 px-1">
              {playbackRate}x
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <CaptionsToggle 
              enabled={captionsEnabled}
              onToggle={onToggleCaptions}
            />
            
            <VideoSettingsMenu
              playbackRate={playbackRate}
              videoQuality={videoQuality}
              captionsEnabled={captionsEnabled}
              availableQualities={availableQualities}
              onPlaybackRateChange={onPlaybackRateChange}
              onQualityChange={onQualityChange}
              onToggleCaptions={onToggleCaptions}
            />
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2 transition-colors" 
              onClick={onToggleFullscreen}
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

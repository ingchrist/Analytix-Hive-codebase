
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Settings, Check } from 'lucide-react';

interface VideoSettingsMenuProps {
  playbackRate: number;
  videoQuality: string;
  captionsEnabled: boolean;
  availableQualities: string[];
  onPlaybackRateChange: (rate: number) => void;
  onQualityChange: (quality: string) => void;
  onToggleCaptions: () => void;
}

export const VideoSettingsMenu: React.FC<VideoSettingsMenuProps> = ({
  playbackRate,
  videoQuality,
  captionsEnabled,
  availableQualities,
  onPlaybackRateChange,
  onQualityChange,
  onToggleCaptions
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-white/20 p-2 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-black/95 border-gray-600 text-white min-w-[200px] backdrop-blur-sm z-50" 
        align="end"
      >
        <DropdownMenuLabel className="text-gray-300">Video Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-600" />
        
        {/* Playback Speed */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DropdownMenuItem 
              className="hover:bg-white/20 cursor-pointer flex justify-between items-center"
              onSelect={(e) => e.preventDefault()}
            >
              <span>Playback Speed</span>
              <span className="text-[#fdb606]">{playbackRate}x</span>
            </DropdownMenuItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="bg-black/95 border-gray-600 text-white backdrop-blur-sm z-50" 
            side="left"
          >
            {speedOptions.map((speed) => (
              <DropdownMenuItem
                key={speed}
                className="hover:bg-white/20 cursor-pointer flex justify-between items-center"
                onClick={() => onPlaybackRateChange(speed)}
              >
                <span>{speed}x</span>
                {playbackRate === speed && <Check className="w-4 h-4 text-[#fdb606]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Video Quality */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DropdownMenuItem 
              className="hover:bg-white/20 cursor-pointer flex justify-between items-center"
              onSelect={(e) => e.preventDefault()}
            >
              <span>Quality</span>
              <span className="text-[#fdb606]">{videoQuality}</span>
            </DropdownMenuItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="bg-black/95 border-gray-600 text-white backdrop-blur-sm z-50" 
            side="left"
          >
            {availableQualities.map((quality) => (
              <DropdownMenuItem
                key={quality}
                className="hover:bg-white/20 cursor-pointer flex justify-between items-center"
                onClick={() => onQualityChange(quality)}
              >
                <span>{quality}</span>
                {videoQuality === quality && <Check className="w-4 h-4 text-[#fdb606]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Captions */}
        <DropdownMenuItem
          className="hover:bg-white/20 cursor-pointer flex justify-between items-center"
          onClick={onToggleCaptions}
        >
          <span>Captions</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{captionsEnabled ? 'On' : 'Off'}</span>
            {captionsEnabled && <Check className="w-4 h-4 text-[#fdb606]" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import React, { useState, useRef, useEffect, useCallback, JSX } from 'react';
import { VideoPlayer } from '@/components/lms/VideoPlayer';
import { VideoControls } from '@/components/lms/VideoControls';
import { CheckCircle } from 'lucide-react';
import { NavigationArrows } from '@/app/(private routes)/course/chapter/_components/NavigationArrows';
import { useCourse } from '@/app/(private routes)/(student)/courses/chapter/_components/CourseContext';
import type { VideoPlayerSectionProps, Timer } from '@/types/video';
import { debounce } from '@/lib/utils';

import '@/app/globals.css';

export const VideoPlayerSection = ({
  lecture,
  onNext,
  onPrevious,
  onMarkComplete,
  isCompleted,
  onVideoEnd,
  onTimeUpdate
}: VideoPlayerSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<Timer | null>(null); // Fix: Provide initial value
  const isMountedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [availableQualities] = useState(['Auto', '1080p', '720p', '480p', '360p']);

  const {
    goToNextLecture,
    goToPreviousLecture,
    allLectures,
    currentIndex
  } = useCourse();
  
  const defaultVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const debouncedVolumeChange = useCallback(
    (newVolume: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      localStorage.setItem('video-volume', newVolume.toString());
    },
    [] // Fix: Use empty dependency array instead of debounce wrapper
  );

  const handleSeek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
      setCurrentTime(time);
    },
    [] // Fix: Use empty dependency array instead of debounce wrapper
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    localStorage.setItem('video-volume', newVolume.toString());
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    setVideoQuality(quality);
    console.log(`Quality changed to: ${quality}`);
  }, []);

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled(!captionsEnabled);
    console.log(`Captions ${!captionsEnabled ? 'enabled' : 'disabled'}`);
  }, [captionsEnabled]);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const video = videoRef.current;
    if (!video) return;

    const storedVolume = localStorage.getItem('video-volume');
    if (storedVolume) {
      const newVolume = parseFloat(storedVolume);
      if (!isNaN(newVolume) && newVolume >= 0 && newVolume <= 1) {
        setVolume(newVolume);
        video.volume = newVolume;
      }
    }

    const updateTime = () => {
      if (!isMountedRef.current) return;
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };
    
    const updateDuration = () => {
      if (!isMountedRef.current) return;
      const videoDuration = video.duration;
      if (!isNaN(videoDuration) && isFinite(videoDuration)) {
        setDuration(videoDuration);
      }
    };
    
    const handlePlay = () => isMountedRef.current && setIsPlaying(true);
    const handlePause = () => isMountedRef.current && setIsPlaying(false);
    const handleLoadStart = () => {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
    };
    const handleCanPlay = () => isMountedRef.current && setIsLoading(false);
    const handleEnded = () => {
      if (!isMountedRef.current) return;
      setIsPlaying(false);
      onVideoEnd();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onNext();
        }
      }, 2000);
    };
    const handleError = (e: Event) => {
      if (!isMountedRef.current) return;
      console.error('Video error:', e);
      const videoElement = e.target as HTMLVideoElement;
      const errorMessage = videoElement.error?.message || 'Failed to load video. Please try again later.';
      setError(errorMessage);
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      isMountedRef.current = false;
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Reset video state on cleanup
      video.pause();
      video.currentTime = 0;
      video.src = '';
    };
  }, [onNext, onVideoEnd, onTimeUpdate]);

  useEffect(() => {
    if (videoRef.current) {
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.currentTime = 0;
    }
  }, [lecture?.id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.repeat) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          if (!e.altKey) {
            e.preventDefault();
            skipBackward();
          }
          break;
        case 'ArrowRight':
          if (!e.altKey) {
            e.preventDefault();
            skipForward();
          }
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume, skipForward, skipBackward, toggleFullscreen, handleVolumeChange, toggleMute, togglePlay]);

  if (!lecture) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <h2 className="text-xl mb-2">Select a lecture to start learning</h2>
          <p>Choose from the course content on the right</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="relative flex-1 min-h-0 group">
        {isLoading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-white">Loading video...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-red-500">{error}</div>
          </div>
        )}
        
        <div className="relative h-full w-full">
          <VideoPlayer
            ref={videoRef}
            src={lecture.videoUrl || defaultVideoUrl}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          />

          <NavigationArrows
            canGoPrevious={currentIndex > 0}
            canGoNext={currentIndex < allLectures.length - 1}
            onPrevious={goToPreviousLecture}
            onNext={goToNextLecture}
            previousTitle={currentIndex > 0 ? allLectures[currentIndex - 1].title : ''}
            nextTitle={currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1].title : ''}
          />
        </div>

        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          videoQuality={videoQuality}
          captionsEnabled={captionsEnabled}
          availableQualities={availableQualities}
          showControls={showControls}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onPlaybackRateChange={changePlaybackRate}
          onQualityChange={handleQualityChange}
          onToggleCaptions={toggleCaptions}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      <div className="flex-shrink-0 bg-[#2d2f31] border-t border-[#3e4143] max-h-[40vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white mb-2 pr-4">
                {lecture.title}
              </h2>
              {lecture.description && (
                <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                  {lecture.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Lecture {lecture.id}</span>
                {lecture.duration > 0 && (
                  <span>{Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}</span>
                )}
                <span className="capitalize">{lecture.type}</span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {lecture.attachments && lecture.attachments.length > 0 && (
            <div className="p-4 bg-[#3e4143] rounded-lg">
              <h3 className="text-white font-medium mb-3">Course Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lecture.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.type === 'quiz' ? `/quiz/${lecture.id}/${attachment.id}` : `/attachment/${lecture.id}/${attachment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-[#5e6163] rounded hover:border-[#fdb606] transition-colors group"
                  >
                    <h4 className="font-medium text-white group-hover:text-[#fdb606] text-sm mb-1">
                      {attachment.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-1">{attachment.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#fdb606] capitalize">{attachment.type}</span>
                      {attachment.fileSize && (
                        <span className="text-xs text-gray-500">{attachment.fileSize}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

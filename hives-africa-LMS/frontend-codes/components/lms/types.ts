import type { Lecture } from '@/types/course';

export interface VideoPlayerSectionProps {
  lecture?: Lecture;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
  onVideoEnd: () => void;
  onTimeUpdate?: (time: number) => void;
}

declare global {
  interface HTMLVideoElement {
    requestFullscreen(): Promise<void>;
  }
  
  interface Document {
    exitFullscreen(): Promise<void>;
  }
}

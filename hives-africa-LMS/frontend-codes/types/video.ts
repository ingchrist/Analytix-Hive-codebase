import type { Lecture } from './course';

export interface VideoPlayerSectionProps {
  lecture?: Lecture;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
  onVideoEnd: () => void;
  onTimeUpdate?: (time: number) => void;
}

export type Timer = ReturnType<typeof setTimeout>;
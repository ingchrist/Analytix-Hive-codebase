
import React from 'react';
import { VideoPlayerSection } from '@/components/lms/VideoPlayerSection';
import { QuizRenderer } from '@/components/lms/QuizRenderer';
import { DocumentRenderer } from '@/components/lms/DocumentRenderer';
import { ResourceRenderer } from '@/components/lms/ResourceRenderer';
import type { Lecture, CourseData } from '@/types/course';

interface ContentRendererProps {
  lecture?: Lecture;
  courseData: CourseData;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
  onVideoEnd: () => void;
  onTimeUpdate: (time: number) => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  lecture,
  courseData,
  onNext,
  onPrevious,
  onMarkComplete,
  isCompleted,
  onVideoEnd,
  onTimeUpdate
}) => {
  if (!lecture) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <h2 className="text-xl mb-2">Select a lecture to start learning</h2>
          <p>Choose from the course content on the right</p>
        </div>
      </div>
    );
  }

  switch (lecture.type) {
    case 'video':
      return (
        <VideoPlayerSection
          lecture={lecture}
          onNext={onNext}
          onPrevious={onPrevious}
          onMarkComplete={onMarkComplete}
          isCompleted={isCompleted}
          onVideoEnd={onVideoEnd}
          onTimeUpdate={onTimeUpdate}
        />
      );
    
    case 'quiz':
      return (
        <QuizRenderer
          lecture={lecture}
          onNext={onNext}
          onPrevious={onPrevious}
          onMarkComplete={onMarkComplete}
          isCompleted={isCompleted}
        />
      );
    
    case 'resource':
      return (
        <ResourceRenderer
          lecture={lecture}
          onNext={onNext}
          onPrevious={onPrevious}
          onMarkComplete={onMarkComplete}
          isCompleted={isCompleted}
        />
      );
    
    default:
      return (
        <div className="flex-1 bg-black flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <h2 className="text-xl mb-2">Content type not supported</h2>
            <p>This content type is not yet implemented</p>
          </div>
        </div>
      );
  }
};

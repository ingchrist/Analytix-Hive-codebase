"use client";
import React from 'react';
import { VideoPlayerSection } from '@/components/lms/VideoPlayerSection';
import { QuizRenderer } from '@/components/lms/QuizRenderer';
import { DocumentRenderer } from '@/components/lms/DocumentRenderer';
import { ResourceRenderer } from '@/components/lms/ResourceRenderer';
import { useCourse } from '../_components/CourseContext';

const ContentPage: React.FC = () => {
  const {
    activeLecture,
    completedLectures,
    handleMarkComplete,
    goToNextLecture,
    goToPreviousLecture,
    setCurrentTime
  } = useCourse();

  if (!activeLecture) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <h2 className="text-xl mb-2">Select a lecture to start learning</h2>
          <p>Choose from the course content on the right</p>
        </div>
      </div>
    );
  }

  const isCompleted = completedLectures.includes(activeLecture.id);

  const handleVideoEnd = () => {
    handleMarkComplete(activeLecture.id);
  };

  const onMarkCompleteHandler = () => {
    handleMarkComplete(activeLecture.id);
  };

  switch (activeLecture.type) {
    case 'video':
      return (
        
        <VideoPlayerSection
          lecture={activeLecture}
          onNext={goToNextLecture}
          onPrevious={goToPreviousLecture}
          onMarkComplete={onMarkCompleteHandler}
          isCompleted={isCompleted}
          onVideoEnd={handleVideoEnd}
          onTimeUpdate={setCurrentTime}
        />
      );
    
    case 'quiz':
      return (
        <QuizRenderer
          lecture={activeLecture}
          onNext={goToNextLecture}
          onPrevious={goToPreviousLecture}
          onMarkComplete={onMarkCompleteHandler}
          isCompleted={isCompleted}
        />
      );
    
    case 'resource':
      return (
        <ResourceRenderer
          lecture={activeLecture}
          onNext={goToNextLecture}
          onPrevious={goToPreviousLecture}
          onMarkComplete={onMarkCompleteHandler}
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

export default ContentPage;
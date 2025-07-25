
import React, { useState, useEffect } from 'react';
import { CourseHeader } from '@/components/lms/CourseHeader';
import { CourseSidebar } from '@/components/lms/CourseSidebar';
import { ContentRenderer } from '@/components/lms/ContentRenderer';
import { NavigationArrows } from '@/components/lms/NavigationArrows';
import type { CourseData } from '@/types/course';

interface CourseLayoutProps {
  courseData: CourseData;
  activeLectureId: number;
  completedLectures: number[];
  currentTime: number;
  onLectureSelect: (lectureId: number) => void;
  onMarkComplete: (lectureId: number) => void;
  onTimeUpdate: (time: number) => void;
}

export const CourseLayout: React.FC<CourseLayoutProps> = ({
  courseData,
  activeLectureId,
  completedLectures,
  currentTime,
  onLectureSelect,
  onMarkComplete,
  onTimeUpdate
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3, 4, 5]);

  // Find active lecture
  const activeLecture = courseData.sections
    .flatMap(section => section.lectures)
    .find(lecture => lecture.id === activeLectureId);

  // Get all lectures in order for navigation
  const allLectures = courseData.sections.flatMap(section => section.lectures);
  const currentIndex = allLectures.findIndex(lecture => lecture.id === activeLectureId);

  const goToNextLecture = () => {
    if (currentIndex < allLectures.length - 1) {
      const nextLecture = allLectures[currentIndex + 1];
      onLectureSelect(nextLecture.id);
      // Auto-mark current lecture as complete when moving to next
      if (activeLecture) {
        onMarkComplete(activeLecture.id);
      }
    }
  };

  const goToPreviousLecture = () => {
    if (currentIndex > 0) {
      onLectureSelect(allLectures[currentIndex - 1].id);
    }
  };

  const toggleSectionExpanded = (sectionId: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const completionPercentage = (completedLectures.length / courseData.totalLectures) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
      switch (e.code) {
        case 'ArrowLeft':
          if (e.altKey) {
            e.preventDefault();
            goToPreviousLecture();
          }
          break;
        case 'ArrowRight':
          if (e.altKey) {
            e.preventDefault();
            goToNextLecture();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-[#1c1d1f] text-white">
      <CourseHeader 
        course={courseData}
        completionPercentage={completionPercentage}
        completedLectures={completedLectures.length}
      />
      
      <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
        {/* Content Area */}
        <div 
          className={`transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-full' : 'w-full lg:w-[calc(100%-400px)]'
          }`}
        >
          <ContentRenderer
            lecture={activeLecture}
            courseData={courseData}
            onNext={goToNextLecture}
            onPrevious={goToPreviousLecture}
            onMarkComplete={() => activeLecture && onMarkComplete(activeLecture.id)}
            isCompleted={activeLecture ? completedLectures.includes(activeLecture.id) : false}
            onVideoEnd={() => activeLecture && onMarkComplete(activeLecture.id)}
            onTimeUpdate={onTimeUpdate}
          />

          {/* Navigation Arrows */}
          <NavigationArrows
            canGoPrevious={currentIndex > 0}
            canGoNext={currentIndex < allLectures.length - 1}
            onPrevious={goToPreviousLecture}
            onNext={goToNextLecture}
            previousTitle={currentIndex > 0 ? allLectures[currentIndex - 1].title : ''}
            nextTitle={currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1].title : ''}
          />
        </div>

        {/* Sidebar */}
        <CourseSidebar
          courseData={courseData}
          activeLectureId={activeLectureId}
          activeTab={activeTab}
          expandedSections={expandedSections}
          completedLectures={completedLectures}
          isCollapsed={isSidebarCollapsed}
          currentTime={currentTime}
          onLectureSelect={onLectureSelect}
          onTabChange={setActiveTab}
          onToggleSection={toggleSectionExpanded}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
    </div>
  );
};

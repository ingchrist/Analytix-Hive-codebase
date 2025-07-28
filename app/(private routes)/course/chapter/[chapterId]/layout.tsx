"use client";
import React, { useState, useEffect } from 'react';
import Footer from "@/components/shared/footer";
import { CourseHeader } from "@/components/lms/CourseHeader";
import { CourseSidebar } from '@/components/lms/CourseSidebar';
import { NavigationArrows } from '@/components/lms/NavigationArrows';

import { useCourse, CourseProvider } from '@/app/(private routes)/(student)/courses/chapter/_components/CourseContext';
const ChapterLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    activeLectureId,
    completedLectures,
    currentTime,
    courseData,
    handleLectureSelect,
    goToNextLecture,
    goToPreviousLecture,
    allLectures,
    currentIndex
  } = useCourse();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3, 4, 5]);

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
  }, [currentIndex, goToNextLecture, goToPreviousLecture]);

  return (
    <div className='min-h-screen bg-[#1c1d1f] text-white'>
      <CourseHeader 
        course={courseData}
        completionPercentage={completionPercentage}
        completedLectures={completedLectures.length}
      />

      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]  relative">
        {/* Content Area */}
        <div 
          className={`transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-full' : 'w-full lg:w-[calc(100%-400px)]'
          }`}
        >
          {children}

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
          onLectureSelect={handleLectureSelect}
          onTabChange={setActiveTab}
          onToggleSection={toggleSectionExpanded}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
    </div>
  );
};

const ChapterLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <CourseProvider>
      <ChapterLayoutContent>
        {children}
      </ChapterLayoutContent>
    </CourseProvider>
  );
};

export default ChapterLayout;

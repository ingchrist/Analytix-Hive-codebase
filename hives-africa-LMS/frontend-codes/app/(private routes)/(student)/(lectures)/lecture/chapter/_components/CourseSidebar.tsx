import React from 'react';
import { SidebarTabs } from '@/components/lms/SidebarTabs';
import { CurriculumList } from '@/components/lms/CurriculumList';
import { AITab } from '@/components/lms/AITab';
import { NotesTab } from '@/components/lms/NotesTab';
import { QATab } from '@/components/lms/QATab';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CourseData, Lecture } from '@/types/course';

interface CourseSidebarProps {
  courseData: CourseData;
  activeLectureId: number;
  activeTab: string;
  expandedSections: number[];
  completedLectures: number[];
  isCollapsed: boolean;
  currentTime: number;
  onLectureSelect: (lectureId: number) => void;
  onTabChange: (tab: string) => void;
  onToggleSection: (sectionId: number) => void;
  onToggleCollapse: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  courseData,
  activeLectureId,
  activeTab,
  expandedSections,
  completedLectures,
  isCollapsed,
  currentTime,
  onLectureSelect,
  onTabChange,
  onToggleSection,
  onToggleCollapse
}) => {
  const activeLecture = courseData.sections
    .flatMap(section => section.lectures)
    .find(lecture => lecture.id === activeLectureId);

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-[80px] h-[calc(100vh-80px)] z-20 lg:relative lg:top-0 lg:h-full">
        <div className="h-full flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-white hover:bg-[#3e4143] p-3 rounded-l-lg rounded-r-none bg-[#2d2f31] border border-[#3e4143] shadow-lg transition-all duration-200"
            title="Show sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-[80px] h-[calc(100vh-80px)] w-[400px] bg-[#2d2f31] border-l border-[#3e4143] flex flex-col z-20 lg:relative lg:top-0 lg:h-full lg:w-[400px] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3e4143] bg-[#2d2f31]">
        <h3 className="text-lg font-semibold text-white">Course Content</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white hover:bg-[#3e4143] p-2 transition-colors"
          title="Hide sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <SidebarTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-hidden">
        {activeTab === 'curriculum' && (
          <CurriculumList
            sections={courseData.sections}
            activeLectureId={activeLectureId}
            expandedSections={expandedSections}
            completedLectures={completedLectures}
            onLectureSelect={onLectureSelect}
            onToggleSection={onToggleSection}
          />
        )}
        {activeTab === 'overview' && (
          <div className="p-4 text-gray-400 overflow-y-auto">
            <h4 className="font-medium text-white mb-3">Course Overview</h4>
            <div className="space-y-6 text-sm">
              <div>
                <h5 className="text-white font-medium mb-3">About This Course</h5>
                <p className="leading-relaxed mb-4">
                  {courseData.description || "This comprehensive web development course covers everything from HTML basics to advanced JavaScript concepts."}
                </p>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-3">What You&apos;ll Learn</h5>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Master HTML structure and semantic elements for accessibility</li>
                  <li>Create responsive designs with modern CSS techniques</li>
                  <li>Build interactive web applications with JavaScript</li>
                  <li>Work with APIs and handle asynchronous programming</li>
                  <li>Implement modern web development best practices</li>
                  <li>Deploy and optimize websites for production</li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-3">Course Structure</h5>
                <div className="space-y-3">
                  {courseData.sections.map((section) => (
                    <div key={section.id} className="p-3 bg-[#3e4143] rounded-lg">
                      <h6 className="text-white font-medium text-sm mb-1">{section.title}</h6>
                      <div className="text-xs text-gray-400">
                        {section.lectures.length} lectures • {Math.floor(section.lectures.reduce((sum, lecture) => sum + lecture.duration, 0) / 60)} minutes
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-3">Course Statistics</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#3e4143] rounded-lg">
                    <div className="text-xl font-bold text-[#fdb606]">{courseData.totalLectures}</div>
                    <div className="text-xs">Total Lectures</div>
                  </div>
                  <div className="text-center p-3 bg-[#3e4143] rounded-lg">
                    <div className="text-xl font-bold text-[#fdb606]">
                      {Math.floor(courseData.sections.reduce((sum, section) => 
                        sum + section.lectures.reduce((lectureSum, lecture) => lectureSum + lecture.duration, 0), 0
                      ) / 3600)}h
                    </div>
                    <div className="text-xs">Total Duration</div>
                  </div>
                  <div className="text-center p-3 bg-[#3e4143] rounded-lg">
                    <div className="text-xl font-bold text-green-400">{completedLectures.length}</div>
                    <div className="text-xs">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-[#3e4143] rounded-lg">
                    <div className="text-xl font-bold text-blue-400">
                      {Math.round((completedLectures.length / courseData.totalLectures) * 100)}%
                    </div>
                    <div className="text-xs">Progress</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-white font-medium mb-3">Prerequisites</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Basic computer literacy</li>
                  <li>• No prior programming experience required</li>
                  <li>• A modern web browser and text editor</li>
                  <li>• Enthusiasm to learn and build projects!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'notes' && activeLecture && (
          <NotesTab 
            lectureId={activeLecture.id}
            lectureTitle={activeLecture.title}
            currentTime={currentTime}
          />
        )}
        {activeTab === 'qa' && activeLecture && (
          <QATab 
            lectureId={activeLecture.id}
            lectureTitle={activeLecture.title}
            currentTime={currentTime}
          />
        )}
        {activeTab === 'ai' && activeLecture && (
          <AITab 
            lectureTitle={activeLecture.title}
            lectureId={activeLecture.id}
          />
        )}
      </div>
    </div>
  );
};

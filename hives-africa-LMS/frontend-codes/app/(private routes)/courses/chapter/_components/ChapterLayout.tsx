// "use client";
// import React, { useState, useEffect } from 'react';
// import Footer from "@/components/shared/footer";
// import { CourseHeader } from "@/components/lms/CourseHeader";
// import { CourseSidebar } from '@/components/lms/CourseSidebar';
// import { NavigationArrows } from '@/components/lms/NavigationArrows';
// import { courseData } from "@/data/courseData";

// const ChapterLayout = ({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) => {
//   const [activeLectureId, setActiveLectureId] = useState(7);
//   const [completedLectures, setCompletedLectures] = useState<number[]>(
//     courseData.sections.flatMap(section => 
//       section.lectures.filter(lecture => lecture.completed).map(lecture => lecture.id)
//     )
//   );
//   const [currentTime, setCurrentTime] = useState(0);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState('curriculum');
//   const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3, 4, 5]);

//   const handleLectureSelect = (lectureId: number) => {
//     setActiveLectureId(lectureId);
//     // Navigate to the content page with the lecture ID
//     window.location.href = `/course/lecture/${lectureId}`;
//   };

//   const handleMarkComplete = (lectureId: number) => {
//     if (!completedLectures.includes(lectureId)) {
//       setCompletedLectures(prev => [...prev, lectureId]);
//       courseData.completedLectures = completedLectures.length + 1;
//     }
//   };

//   // Find active lecture
//   const activeLecture = courseData.sections
//     .flatMap(section => section.lectures)
//     .find(lecture => lecture.id === activeLectureId);

//   // Get all lectures in order for navigation
//   const allLectures = courseData.sections.flatMap(section => section.lectures);
//   const currentIndex = allLectures.findIndex(lecture => lecture.id === activeLectureId);

//   const goToNextLecture = () => {
//     if (currentIndex < allLectures.length - 1) {
//       const nextLecture = allLectures[currentIndex + 1];
//       handleLectureSelect(nextLecture.id);
//       // Auto-mark current lecture as complete when moving to next
//       if (activeLecture) {
//         handleMarkComplete(activeLecture.id);
//       }
//     }
//   };

//   const goToPreviousLecture = () => {
//     if (currentIndex > 0) {
//       handleLectureSelect(allLectures[currentIndex - 1].id);
//     }
//   };

//   const toggleSectionExpanded = (sectionId: number) => {
//     setExpandedSections(prev => 
//       prev.includes(sectionId) 
//         ? prev.filter(id => id !== sectionId)
//         : [...prev, sectionId]
//     );
//   };

//   const completionPercentage = (completedLectures.length / courseData.totalLectures) * 100;

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
//       if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
//       switch (e.code) {
//         case 'ArrowLeft':
//           if (e.altKey) {
//             e.preventDefault();
//             goToPreviousLecture();
//           }
//           break;
//         case 'ArrowRight':
//           if (e.altKey) {
//             e.preventDefault();
//             goToNextLecture();
//           }
//           break;
//       }
//     };

//     document.addEventListener('keydown', handleKeyPress);
//     return () => document.removeEventListener('keydown', handleKeyPress);
//   }, [currentIndex]);

//   return (
//     <>
//       <div className='min-h-screen bg-[#1c1d1f] text-white'>
//         <CourseHeader 
//           course={courseData}
//           completionPercentage={completionPercentage}
//           completedLectures={completedLectures.length}
//         />

//         <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
//           {/* Content Area - This will render the children */}
//           <div 
//             className={`transition-all duration-300 relative ${
//               isSidebarCollapsed ? 'w-full' : 'w-full lg:w-[calc(100%-400px)]'
//             }`}
//           >
//             {/* Pass necessary props to children through React.cloneElement */}
//             {React.Children.map(children, child => {
//               if (React.isValidElement(child)) {
//                 return React.cloneElement(child, {
//                   activeLectureId,
//                   courseData,
//                   onNext: goToNextLecture,
//                   onPrevious: goToPreviousLecture,
//                   onMarkComplete: (lectureId?: number) => handleMarkComplete(lectureId || activeLectureId),
//                   completedLectures,
//                   onTimeUpdate: setCurrentTime,
//                   currentIndex,
//                   allLectures
//                 } as any);
//               }
//               return child;
//             })}

//             {/* Navigation Arrows */}
//             <NavigationArrows
//               canGoPrevious={currentIndex > 0}
//               canGoNext={currentIndex < allLectures.length - 1}
//               onPrevious={goToPreviousLecture}
//               onNext={goToNextLecture}
//               previousTitle={currentIndex > 0 ? allLectures[currentIndex - 1].title : ''}
//               nextTitle={currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1].title : ''}
//             />
//           </div>

//           {/* Sidebar */}
//           <CourseSidebar
//             courseData={courseData}
//             activeLectureId={activeLectureId}
//             activeTab={activeTab}
//             expandedSections={expandedSections}
//             completedLectures={completedLectures}
//             isCollapsed={isSidebarCollapsed}
//             currentTime={currentTime}
//             onLectureSelect={handleLectureSelect}
//             onTabChange={setActiveTab}
//             onToggleSection={toggleSectionExpanded}
//             onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

// export default ChapterLayout;

// // =================================================================
// // ContentPage.tsx - Separate page component for content rendering
// "use client";
// import React from 'react';
// import { useParams } from 'next/navigation';
// import { VideoPlayerSection } from '@/components/lms/VideoPlayerSection';
// import { QuizRenderer } from '@/components/lms/QuizRenderer';
// import { DocumentRenderer } from '@/components/lms/DocumentRenderer';
// import { ResourceRenderer } from '@/components/lms/ResourceRenderer';
// import type { Lecture, CourseData } from '@/types/course';

// interface ContentPageProps {
//   activeLectureId?: number;
//   courseData?: CourseData;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   onMarkComplete?: (lectureId?: number) => void;
//   completedLectures?: number[];
//   onTimeUpdate?: (time: number) => void;
//   currentIndex?: number;
//   allLectures?: Lecture[];
// }

// const ContentPage: React.FC<ContentPageProps> = ({
//   activeLectureId,
//   courseData,
//   onNext = () => {},
//   onPrevious = () => {},
//   onMarkComplete = () => {},
//   completedLectures = [],
//   onTimeUpdate = () => {},
// }) => {
//   const params = useParams();
  
//   // Get lecture ID from URL params if not passed as prop
//   const lectureId = activeLectureId || (params?.lectureId ? parseInt(params.lectureId as string) : null);
  
//   if (!courseData || !lectureId) {
//     return (
//       <div className="flex-1 bg-black flex items-center justify-center h-full">
//         <div className="text-center text-gray-400">
//           <h2 className="text-xl mb-2">Loading course content...</h2>
//           <p>Please wait while we load the lecture</p>
//         </div>
//       </div>
//     );
//   }

//   // Find the lecture based on ID
//   const lecture = courseData.sections
//     .flatMap(section => section.lectures)
//     .find(lecture => lecture.id === lectureId);

//   if (!lecture) {
//     return (
//       <div className="flex-1 bg-black flex items-center justify-center h-full">
//         <div className="text-center text-gray-400">
//           <h2 className="text-xl mb-2">Lecture not found</h2>
//           <p>The requested lecture could not be found</p>
//         </div>
//       </div>
//     );
//   }

//   const isCompleted = completedLectures.includes(lecture.id);

//   const handleVideoEnd = () => {
//     onMarkComplete(lecture.id);
//   };

//   switch (lecture.type) {
//     case 'video':
//       return (
//         <VideoPlayerSection
//           lecture={lecture}
//           onNext={onNext}
//           onPrevious={onPrevious}
//           onMarkComplete={() => onMarkComplete(lecture.id)}
//           isCompleted={isCompleted}
//           onVideoEnd={handleVideoEnd}
//           onTimeUpdate={onTimeUpdate}
//         />
//       );
    
//     case 'quiz':
//       return (
//         <QuizRenderer
//           lecture={lecture}
//           onNext={onNext}
//           onPrevious={onPrevious}
//           onMarkComplete={() => onMarkComplete(lecture.id)}
//           isCompleted={isCompleted}
//         />
//       );
    
//     case 'resource':
//       return (
//         <ResourceRenderer
//           lecture={lecture}
//           onNext={onNext}
//           onPrevious={onPrevious}
//           onMarkComplete={() => onMarkComplete(lecture.id)}
//           isCompleted={isCompleted}
//         />
//       );
    
//     default:
//       return (
//         <div className="flex-1 bg-black flex items-center justify-center h-full">
//           <div className="text-center text-gray-400">
//             <h2 className="text-xl mb-2">Content type not supported</h2>
//             <p>This content type is not yet implemented</p>
//           </div>
//         </div>
//       );
//   }
// };

// export default ContentPage;

// =================================================================
// Alternative Context-based approach (Recommended)
// CourseContext.tsx - Context for sharing course state

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { courseData } from "@/data/courseData";
// import type { CourseData, Lecture } from '@/types/course';

// interface CourseContextType {
//   activeLectureId: number;
//   completedLectures: number[];
//   currentTime: number;
//   courseData: CourseData;
//   setActiveLectureId: (id: number) => void;
//   setCompletedLectures: (lectures: number[]) => void;
//   setCurrentTime: (time: number) => void;
//   handleLectureSelect: (lectureId: number) => void;
//   handleMarkComplete: (lectureId: number) => void;
//   goToNextLecture: () => void;
//   goToPreviousLecture: () => void;
//   allLectures: Lecture[];
//   currentIndex: number;
//   activeLecture?: Lecture;
// }

// const CourseContext = createContext<CourseContextType | undefined>(undefined);

// export const useCourse = () => {
//   const context = useContext(CourseContext);
//   if (context === undefined) {
//     throw new Error('useCourse must be used within a CourseProvider');
//   }
//   return context;
// };

// export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [activeLectureId, setActiveLectureId] = useState(7);
//   const [completedLectures, setCompletedLectures] = useState<number[]>(
//     courseData.sections.flatMap(section => 
//       section.lectures.filter(lecture => lecture.completed).map(lecture => lecture.id)
//     )
//   );
//   const [currentTime, setCurrentTime] = useState(0);

//   const allLectures = courseData.sections.flatMap(section => section.lectures);
//   const currentIndex = allLectures.findIndex(lecture => lecture.id === activeLectureId);
//   const activeLecture = allLectures.find(lecture => lecture.id === activeLectureId);

//   const handleLectureSelect = (lectureId: number) => {
//     setActiveLectureId(lectureId);
//   };

//   const handleMarkComplete = (lectureId: number) => {
//     if (!completedLectures.includes(lectureId)) {
//       setCompletedLectures(prev => [...prev, lectureId]);
//       courseData.completedLectures = completedLectures.length + 1;
//     }
//   };

//   const goToNextLecture = () => {
//     if (currentIndex < allLectures.length - 1) {
//       const nextLecture = allLectures[currentIndex + 1];
//       handleLectureSelect(nextLecture.id);
//       if (activeLecture) {
//         handleMarkComplete(activeLecture.id);
//       }
//     }
//   };

//   const goToPreviousLecture = () => {
//     if (currentIndex > 0) {
//       handleLectureSelect(allLectures[currentIndex - 1].id);
//     }
//   };

//   const value: CourseContextType = {
//     activeLectureId,
//     completedLectures,
//     currentTime,
//     courseData,
//     setActiveLectureId,
//     setCompletedLectures,
//     setCurrentTime,
//     handleLectureSelect,
//     handleMarkComplete,
//     goToNextLecture,
//     goToPreviousLecture,
//     allLectures,
//     currentIndex,
//     activeLecture
//   };

//   return (
//     <CourseContext.Provider value={value}>
//       {children}
//     </CourseContext.Provider>
//   );
// };

// // =================================================================
// // Updated Layout with Context (Recommended approach)
// // layout.tsx
// "use client";
// import React, { useState, useEffect } from 'react';
// import Footer from "@/components/shared/footer";
// import { CourseHeader } from "@/components/lms/CourseHeader";
// import { CourseSidebar } from '@/components/lms/CourseSidebar';
// import { NavigationArrows } from '@/components/lms/NavigationArrows';
// import { CourseProvider, useCourse } from './CourseContext';

// const ChapterLayoutContent = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const {
//     activeLectureId,
//     completedLectures,
//     currentTime,
//     courseData,
//     handleLectureSelect,
//     goToNextLecture,
//     goToPreviousLecture,
//     allLectures,
//     currentIndex
//   } = useCourse();

//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState('curriculum');
//   const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3, 4, 5]);

//   const toggleSectionExpanded = (sectionId: number) => {
//     setExpandedSections(prev => 
//       prev.includes(sectionId) 
//         ? prev.filter(id => id !== sectionId)
//         : [...prev, sectionId]
//     );
//   };

//   const completionPercentage = (completedLectures.length / courseData.totalLectures) * 100;

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
//       if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
//       switch (e.code) {
//         case 'ArrowLeft':
//           if (e.altKey) {
//             e.preventDefault();
//             goToPreviousLecture();
//           }
//           break;
//         case 'ArrowRight':
//           if (e.altKey) {
//             e.preventDefault();
//             goToNextLecture();
//           }
//           break;
//       }
//     };

//     document.addEventListener('keydown', handleKeyPress);
//     return () => document.removeEventListener('keydown', handleKeyPress);
//   }, [currentIndex, goToNextLecture, goToPreviousLecture]);

//   return (
//     <div className='min-h-screen bg-[#1c1d1f] text-white'>
//       <CourseHeader 
//         course={courseData}
//         completionPercentage={completionPercentage}
//         completedLectures={completedLectures.length}
//       />

//       <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
//         {/* Content Area */}
//         <div 
//           className={`transition-all duration-300 relative ${
//             isSidebarCollapsed ? 'w-full' : 'w-full lg:w-[calc(100%-400px)]'
//           }`}
//         >
//           {children}

//           {/* Navigation Arrows */}
//           <NavigationArrows
//             canGoPrevious={currentIndex > 0}
//             canGoNext={currentIndex < allLectures.length - 1}
//             onPrevious={goToPreviousLecture}
//             onNext={goToNextLecture}
//             previousTitle={currentIndex > 0 ? allLectures[currentIndex - 1].title : ''}
//             nextTitle={currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1].title : ''}
//           />
//         </div>

//         {/* Sidebar */}
//         <CourseSidebar
//           courseData={courseData}
//           activeLectureId={activeLectureId}
//           activeTab={activeTab}
//           expandedSections={expandedSections}
//           completedLectures={completedLectures}
//           isCollapsed={isSidebarCollapsed}
//           currentTime={currentTime}
//           onLectureSelect={handleLectureSelect}
//           onTabChange={setActiveTab}
//           onToggleSection={toggleSectionExpanded}
//           onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//         />
//       </div>
//     </div>
//   );
// };

// const ChapterLayout = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   return (
//     <CourseProvider>
//       <ChapterLayoutContent>
//         {children}
//       </ChapterLayoutContent>
//     </CourseProvider>
//   );
// };

// export default ChapterLayout;
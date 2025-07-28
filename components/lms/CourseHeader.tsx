
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CourseHeaderProps {
  course?: {
    title: string;
    instructor: string;
    totalLectures: number;
  };
  completionPercentage?: number;
  completedLectures?: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  completionPercentage,
  completedLectures
}) => {
  return (
    <div className="bg-[#2d2f31] border-b border-[#3e4143] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-white truncate mb-1">
            {course?.title}
          </h1>
          <p className="text-sm text-gray-400">
            By {course?.instructor}
          </p>
        </div>
        
        <div className="flex items-center space-x-6 ml-6">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {completedLectures} of {course?.totalLectures} lectures completed
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {Math.round(completionPercentage!)}% complete
            </div>
          </div>
          
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#3e4143"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#fdb606"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage! / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#fdb606]">
                {Math.round(completionPercentage!)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

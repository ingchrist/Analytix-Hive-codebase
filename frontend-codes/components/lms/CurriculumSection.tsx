
import React from 'react';
import { LectureItem } from '@/components/lms/LectureItem';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Lecture {
  id: number;
  title: string;
  duration: number;
  type: 'video' | 'resource' | 'quiz';
  completed: boolean;
}

interface Section {
  id: number;
  title: string;
  lectures: Lecture[];
}

interface CurriculumSectionProps {
  section: Section;
  isExpanded: boolean;
  activeLectureId: number;
  completedLectures: number[];
  onToggle: () => void;
  onLectureSelect: (lectureId: number) => void;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  section,
  isExpanded,
  activeLectureId,
  completedLectures,
  onToggle,
  onLectureSelect
}) => {
  const totalDuration = section.lectures.reduce((sum, lecture) => sum + lecture.duration, 0);
  const completedCount = section.lectures.filter(lecture => 
    completedLectures.includes(lecture.id)
  ).length;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-[#3e4143] rounded-lg transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <h4 className="font-medium text-white truncate">
                {section.title}
              </h4>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {completedCount}/{section.lectures.length} lectures • {formatDuration(totalDuration)}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="ml-2 mt-1 space-y-1">
          {section.lectures.map((lecture) => (
            <LectureItem
              key={lecture.id}
              lecture={lecture}
              isActive={lecture.id === activeLectureId}
              isCompleted={completedLectures.includes(lecture.id)}
              onClick={() => onLectureSelect(lecture.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

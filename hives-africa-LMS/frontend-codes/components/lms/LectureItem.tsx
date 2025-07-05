
import React from 'react';
import { Play, CheckCircle, FileText, HelpCircle } from 'lucide-react';

interface Lecture {
  id: number;
  title: string;
  duration: number;
  type: 'video' | 'resource' | 'quiz';
}

interface LectureItemProps {
  lecture: Lecture;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export const LectureItem: React.FC<LectureItemProps> = ({
  lecture,
  isActive,
  isCompleted,
  onClick
}) => {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    switch (lecture.type) {
      case 'video':
        return <Play className="w-4 h-4 text-gray-400" />;
      case 'resource':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left rounded-lg transition-all group ${
        isActive 
          ? 'bg-[#fdb606] text-black' 
          : 'hover:bg-[#3e4143] text-white'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={`font-medium text-sm truncate ${
            isActive ? 'text-black' : 'text-white'
          }`}>
            {lecture.title}
          </h5>
          <div className={`flex items-center justify-between text-xs mt-1 ${
            isActive ? 'text-black/70' : 'text-gray-400'
          }`}>
            <span className="capitalize">{lecture.type}</span>
            {lecture.duration > 0 && (
              <span>{formatDuration(lecture.duration)}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

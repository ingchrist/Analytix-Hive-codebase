
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';
import type { Lecture } from '@/types/course';

interface QuizRendererProps {
  lecture: Lecture;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  lecture,
  onNext,
  onPrevious,
  onMarkComplete,
  isCompleted
}) => {
  const handleStartQuiz = () => {
    // Open quiz in new tab/window or handle quiz logic here
    window.open(`/quiz/${lecture.id}`, '_blank');
    // Mark as complete after starting quiz
    onMarkComplete();
  };

  return (
    <div className="flex-1 bg-black flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-2xl p-8">
          <div className="mb-6">
            <HelpCircle className="w-16 h-16 text-[#fdb606] mx-auto mb-4" />
            <h2 className="text-2xl mb-4 text-white">{lecture.title}</h2>
            <p className="mb-8 text-lg">{lecture.description}</p>
          </div>
          
          {isCompleted && (
            <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span>Quiz Completed</span>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleStartQuiz}
              className="bg-[#fdb606] hover:bg-[#e6a406] text-black font-medium px-8 py-3"
            >
              {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#2d2f31] p-6 border-t border-[#3e4143] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Lecture {lecture.id}</span>
            <span className="capitalize">{lecture.type}</span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

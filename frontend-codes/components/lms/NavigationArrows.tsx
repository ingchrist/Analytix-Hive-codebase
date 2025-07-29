
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationArrowsProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  previousTitle: string;
  nextTitle: string;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  previousTitle,
  nextTitle
}) => {
  const [showPreviousTooltip, setShowPreviousTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);

  return (
    <>
      {/* Previous Arrow */}
      {canGoPrevious && (
       <div className="absolute left-0 inset-y-1/2 transform -translate-y-1/2 z-20 px-2 pointer-events-auto">
          <div className="relative">
            <Button
              onClick={onPrevious}
              size="lg"
              className="h-12 w-12 rounded-full bg-black/80 hover:bg-black text-white border border-gray-600 shadow-lg transition-all duration-200 hover:scale-110"
              onMouseEnter={() => setShowPreviousTooltip(true)}
              onMouseLeave={() => setShowPreviousTooltip(false)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            {showPreviousTooltip && previousTitle && (
              <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap max-w-64 shadow-lg border border-gray-600">
                <div className="font-medium">Previous:</div>
                <div className="text-gray-300 truncate">{previousTitle}</div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-black"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Arrow */}
      {canGoNext && (
        <div className="absolute right-0 inset-y-1/2 transform -translate-y-1/2 z-20 px-2 pointer-events-auto">
          <div className="relative">
            <Button
              onClick={onNext}
              size="lg"
              className="h-12 w-12 rounded-full bg-black/80 hover:bg-black text-white border border-gray-600 shadow-lg transition-all duration-200 hover:scale-110"
              onMouseEnter={() => setShowNextTooltip(true)}
              onMouseLeave={() => setShowNextTooltip(false)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            
            {showNextTooltip && nextTitle && (
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap max-w-64 shadow-lg border border-gray-600">
                <div className="font-medium">Next:</div>
                <div className="text-gray-300 truncate">{nextTitle}</div>
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};


import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurriculumSection } from '@/components/lms/CurriculumSection';

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

interface CurriculumListProps {
  sections: Section[];
  activeLectureId: number;
  expandedSections: number[];
  completedLectures: number[];
  onLectureSelect: (lectureId: number) => void;
  onToggleSection: (sectionId: number) => void;
}

export const CurriculumList: React.FC<CurriculumListProps> = ({
  sections,
  activeLectureId,
  expandedSections,
  completedLectures,
  onLectureSelect,
  onToggleSection
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {sections.map((section) => (
          <CurriculumSection
            key={section.id}
            section={section}
            isExpanded={expandedSections.includes(section.id)}
            activeLectureId={activeLectureId}
            completedLectures={completedLectures}
            onToggle={() => onToggleSection(section.id)}
            onLectureSelect={onLectureSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

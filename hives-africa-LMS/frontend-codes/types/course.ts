
export interface Attachment {
  id: number;
  title: string;
  type: 'document' | 'quiz';
  url?: string;
  fileSize?: string;
  description?: string;
}

export interface Lecture {
  id: number;
  title: string;
  duration: number;
  type: 'video' | 'resource' | 'quiz';
  completed: boolean;
  videoUrl?: string;
  description?: string;
  attachments?: Attachment[];
}

export interface Section {
  id: number;
  title: string;
  lectures: Lecture[];
}

export interface CourseData {
  id: number;
  title: string;
  instructor: string;
  description?: string;
  totalLectures: number;
  completedLectures: number;
  sections: Section[];
}

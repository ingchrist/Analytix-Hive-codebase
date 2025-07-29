import type { CourseData } from '@/types/course';
// Enhanced course data with comprehensive content
export const courseData: CourseData = {
  id: 1,
  title: "The Complete Web Developer: Zero to Mastery",
  instructor: "Andrei Neagoie",
  description: "Master modern web development from HTML basics to advanced JavaScript. Build real-world projects, learn industry best practices, and become job-ready with this comprehensive course designed for beginners and intermediate developers.",
  totalLectures: 52,
  completedLectures: 18,
  sections: [
    {
      id: 1,
      title: "Introduction & Getting Started",
      lectures: [
        { 
          id: 1, 
          title: "Course Introduction & Welcome", 
          duration: 180, 
          type: 'video' as const, 
          completed: true, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          description: "Welcome to the complete web development course! Learn what you'll build, the skills you'll gain, and how to get the most out of this course.",
          attachments: [
            {
              id: 1,
              title: "Course Syllabus & Learning Path",
              type: 'document',
              description: "Complete course outline, learning objectives, and recommended study schedule.",
              fileSize: "2.4 MB"
            },
            {
              id: 2,
              title: "Pre-Course Knowledge Check",
              type: 'quiz',
              description: "Quick assessment to gauge your current knowledge level."
            }
          ]
        },
        { 
          id: 2, 
          title: "Setting Up Your Development Environment", 
          duration: 420, 
          type: 'video' as const, 
          completed: true, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          description: "Step-by-step guide to installing and configuring VS Code, browser dev tools, and essential extensions for web development.",
          attachments: [
            {
              id: 3,
              title: "Development Tools Installation Guide",
              type: 'document',
              description: "Detailed instructions for setting up your coding environment across different operating systems.",
              fileSize: "1.8 MB"
            }
          ]
        },
        { 
          id: 3, 
          title: "Course Resources & Community", 
          duration: 0, 
          type: 'resource' as const, 
          completed: true,
          description: "Access exclusive course materials, join our community forum, and discover additional learning resources.",
          attachments: [
            {
              id: 4,
              title: "Resource Library Access",
              type: 'document',
              description: "Links to code repositories, design assets, and supplementary materials.",
              fileSize: "0.5 MB"
            }
          ]
        },
        { 
          id: 4, 
          title: "Knowledge Check: Course Basics", 
          duration: 0, 
          type: 'quiz' as const, 
          completed: false,
          description: "Test your understanding of the course structure and development environment setup."
        },
      ]
    },
    {
      id: 2,
      title: "HTML Fundamentals & Semantic Web",
      lectures: [
        { 
          id: 5, 
          title: "HTML Basics & Document Structure", 
          duration: 660, 
          type: 'video' as const, 
          completed: true, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          description: "Learn the fundamental building blocks of HTML, document structure, and how browsers interpret HTML code.",
          attachments: [
            {
              id: 5,
              title: "HTML Element Reference Guide",
              type: 'document',
              description: "Comprehensive reference of HTML elements with examples and use cases.",
              fileSize: "3.2 MB"
            },
            {
              id: 6,
              title: "HTML Structure Quiz",
              type: 'quiz',
              description: "Test your knowledge of HTML document structure and basic elements."
            }
          ]
        },
        { 
          id: 6, 
          title: "Semantic HTML & Accessibility", 
          duration: 540, 
          type: 'video' as const, 
          completed: true, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          description: "Discover the importance of semantic HTML for accessibility, SEO, and code maintainability.",
          attachments: [
            {
              id: 7,
              title: "Accessibility Checklist",
              type: 'document',
              description: "Essential accessibility guidelines and best practices for web developers.",
              fileSize: "1.5 MB"
            }
          ]
        },
        { 
          id: 7, 
          title: "Forms & User Input Elements", 
          duration: 780, 
          type: 'video' as const, 
          completed: false, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          description: "Master HTML forms, input types, validation, and creating user-friendly interfaces.",
          attachments: [
            {
              id: 8,
              title: "Form Elements Cheat Sheet",
              type: 'document',
              description: "Quick reference for all HTML form elements and their attributes.",
              fileSize: "2.1 MB"
            }
          ]
        },
        { 
          id: 8, 
          title: "HTML5 Advanced Features", 
          duration: 620, 
          type: 'video' as const, 
          completed: false, 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          description: "Explore modern HTML5 features including multimedia elements, canvas, and web APIs.",
          attachments: [
            {
              id: 9,
              title: "HTML5 Feature Support Chart",
              type: 'document',
              description: "Browser compatibility chart for HTML5 features and fallback strategies.",
              fileSize: "0.8 MB"
            }
          ]
        },
        { 
          id: 9, 
          title: "Build Your First Website Project", 
          duration: 0, 
          type: 'resource' as const, 
          completed: false,
          description: "Apply your HTML knowledge to create a complete personal portfolio website.",
          attachments: [
            {
              id: 10,
              title: "Project Requirements & Assets",
              type: 'document',
              description: "Detailed project specifications, starter files, and design mockups.",
              fileSize: "5.3 MB"
            }
          ]
        },
        { 
          id: 10, 
          title: "HTML Mastery Assessment", 
          duration: 0, 
          type: 'quiz' as const, 
          completed: false,
          description: "Comprehensive quiz covering all HTML concepts learned in this section."
        },
      ]
    },
    {
      id: 3,
      title: "CSS Mastery",
      lectures: [
        { id: 11, title: "CSS Introduction", duration: 480, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
        { id: 12, title: "CSS Selectors", duration: 720, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
        { id: 13, title: "CSS Box Model", duration: 600, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
        { id: 14, title: "Flexbox Layout", duration: 900, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
        { id: 15, title: "CSS Grid System", duration: 840, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' },
        { id: 16, title: "CSS Animations", duration: 620, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' },
        { id: 17, title: "Responsive Design", duration: 780, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { id: 18, title: "CSS Resources", duration: 0, type: 'resource' as const, completed: false },
      ]
    },
    {
      id: 4,
      title: "JavaScript Fundamentals",
      lectures: [
        { id: 19, title: "JavaScript Variables", duration: 520, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
        { id: 20, title: "Functions and Scope", duration: 680, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        { id: 21, title: "DOM Manipulation", duration: 750, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
        { id: 22, title: "Event Handling", duration: 640, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
        { id: 23, title: "Async JavaScript", duration: 890, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
        { id: 24, title: "JavaScript Project", duration: 0, type: 'resource' as const, completed: false },
        { id: 25, title: "JavaScript Assessment", duration: 0, type: 'quiz' as const, completed: false },
      ]
    },
    {
      id: 5,
      title: "Advanced Topics",
      lectures: [
        { id: 26, title: "API Integration", duration: 720, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
        { id: 27, title: "Database Basics", duration: 850, type: 'video' as const, completed: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
        { id: 28, title: "Final Project", duration: 0, type: 'resource' as const, completed: false },
      ]
    }
  ]
};
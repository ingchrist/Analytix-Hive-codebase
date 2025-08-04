
"use client"

import { VideoPlayer } from "@/components/lms/VideoPlayer"
import { CourseSidebar } from "@/components/lms/CourseSidebar"
import { NavigationArrows } from "@/components/lms/NavigationArrows"
import { SidebarTabs } from "@/components/lms/SidebarTabs"

export default function ChapterPage({ 
  params 
}: { 
  params: { courseId: string; chapterId: string } 
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <VideoPlayer />
        <NavigationArrows 
          courseId={params.courseId} 
          currentChapterId={params.chapterId} 
        />
      </div>
      
      <div className="w-80 border-l">
        <SidebarTabs />
      </div>
    </div>
  )
}

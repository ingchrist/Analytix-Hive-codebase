import React from 'react'
import { courseData } from '@/data/courseData'
import { CourseHeader } from '@/components/lms/CourseHeader'
const header = () => {
  return (
    <>
    <CourseHeader
    
    course={courseData}
    
    />
    </>
  )
}

export default header
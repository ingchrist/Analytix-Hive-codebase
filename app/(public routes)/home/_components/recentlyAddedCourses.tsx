"use client";

import Image from "next/image";
import { Course } from "../page";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import CourseDetailCard from "./courseDetailCard";

const RecentlyAddedCourses = () => {
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);
  const [detailCardDirection, setDetailCardDirection] = useState<
    "left" | "right"
  >("right");
  const [isMobile, setIsMobile] = useState(false);

  const detailCardRef = useRef<HTMLDivElement | null>(null);
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const updateScreenType = () => {
      const hasHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
      setIsMobile(!hasHover);
    };

    updateScreenType();
    window.addEventListener("resize", updateScreenType);

    return () => window.removeEventListener("resize", updateScreenType);
  }, []);

  const handleCardHover = (course: Course) => {
    const card = courseRefs.current[course.id];

    if (card) {
      const rect = card.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceRight < 350 && spaceLeft > spaceRight) {
        setDetailCardDirection("left");
      } else {
        setDetailCardDirection("right");
      }
    }

    setHoveredCourse(course);
  };

  const recentlyAddedCourses: Course[] = [
    {
      id: "1",
      title: "The Python Mega Course: Build 10 Real World Applications",
      image: "/assets/courses/course-img11.png",
      cost: "3,000",
      discountCost: "2,800",
      discount: "56%",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      category: {
        name: "Design",
        bgColor: "#FFEEE8",
        textColor: "#993D20",
      },
      level: "Beginner",
      duration: "6 hours",
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
      learningOutcomes: [
        "Learn to use Python professionally, learning both Python 2 and Python 3!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
      ],
    },
    {
      id: "2",
      title: "Facebook Ads & Facebook Marketing MASTERY 2021 Cours...",
      image: "/assets/courses/course-img5.png",
      cost: "3,000",
      discountCost: "2,800",
      discount: "56%",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      category: {
        name: "IT & Software",
        bgColor: "#FFF0F0",
        textColor: "#882929",
      },
      level: "Beginner",
      duration: "6 hours",
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
      learningOutcomes: [
        "Learn to use Python professionally, learning both Python 2 and Python 3!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
      ],
    },
    {
      id: "3",
      title: "2021 Complete Python Bootcamp From Zero to Hero in Python",
      image: "/assets/courses/course-img12.png",
      cost: "3,000",
      discountCost: "2,800",
      discount: "56%",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      category: {
        name: "Developments",
        bgColor: "#EBEBFF",
        textColor: "#342F98",
      },
      level: "Beginner",
      duration: "6 hours",
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
      learningOutcomes: [
        "Learn to use Python professionally, learning both Python 2 and Python 3!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
      ],
    },
    {
      id: "4",
      title: "2021 Complete Python Bootcamp From Zero to Hero in Python",
      image: "/assets/courses/course-img12.png",
      cost: "3,000",
      discountCost: "2,800",
      discount: "56%",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      category: {
        name: "Developments",
        bgColor: "#EBEBFF",
        textColor: "#342F98",
      },
      level: "Beginner",
      duration: "6 hours",
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
      learningOutcomes: [
        "Learn to use Python professionally, learning both Python 2 and Python 3!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
        "Create games with Python, like Tic Tac Toe and Blackjack!",
      ],
    },
  ];

  return (
    <>
      <h4 className="text-center text-3xl md:text-[32px] text-darkBlue-300 font-semibold w-full">
        Recently Added Courses
      </h4>

      <div className="relative z-0 overflow-visible flex flex-col lg:flex-row justify-between gap-6 w-full">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 lg:ml-16">
          {recentlyAddedCourses.map((course) => (
            <div
              key={course.id}
              className="relative group"
              ref={(el) => {
                courseRefs.current[course.id] = el;
              }}
              onMouseEnter={() => {
                if (!isMobile) handleCardHover(course);
              }}
              onMouseLeave={() => {
                if (!isMobile) setHoveredCourse(null);
              }}
            >
              {/* Course Card */}
              <div className="cursor-pointer border border-[#E9EAF0] w-full">
                <Image
                  src={course.image}
                  alt="Course Image"
                  width={400}
                  height={300}
                  className="object-contain w-full"
                />

                {/* Text content */}
                <div className="bg-white w-full">
                  <div className="space-y-4 p-3">
                    <div className="flex flex-wrap justify-between items-center gap-1">
                      <p
                        className="uppercase text-[8px] font-semibold p-1"
                        style={{
                          background: course.category.bgColor,
                          color: course.category.textColor,
                        }}
                      >
                        {course.category.name}
                      </p>
                      <p className="text-xs md:text-sm font-semibold text-orange">
                        ₦{course.cost}
                      </p>
                    </div>

                    <p className="text-[10px] sm:text-xs font-semibold text-darkBlue-300 line-clamp-2">
                      {course.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-y-1 border-t border-[#E9EAF0] text-[#4E5566] text-[10px] sm:text-xs p-3 w-full">
                    <p className="flex items-center gap-1 font-semibold">
                      <Star fill="#FD8E1F" strokeWidth={0} size={16} />
                      {course.rating}
                    </p>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/assets/courses/user.png"
                        alt="User"
                        width={50}
                        height={50}
                        className="h-4 w-4"
                      />
                      <p className="font-semibold">
                        {course.numberOfEnrolees}{" "}
                        <span className="font-normal text-[#8C94A3]">
                          students
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Detail Card (Desktop Only) */}
              {!isMobile && hoveredCourse?.id === course.id && (
                <div
                  ref={detailCardRef}
                  className={`absolute -top-1/4 ${
                    detailCardDirection === "left"
                      ? "right-full translate-x-16"
                      : "left-full translate-x-0"
                  } transition-opacity duration-300 ease-in-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 pointer-events-none space-y-4 border rounded shadow-[0px_11.12px_29.65px_0px_#1D20261A] bg-white z-50 -ml-16 py-6 w-84`}
                >
                  <CourseDetailCard course={hoveredCourse} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="cursor-pointer bg-[#FFEEE8] hover:bg-[#FFEEE8CA] text-orange text-xs font-semibold px-6 py-3">
        Browse All Courses →
      </button>
    </>
  );
};

export default RecentlyAddedCourses;

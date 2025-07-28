import { Star } from "lucide-react";
import Image from "next/image";
import { Course } from "../page";

const FeaturedCourses = () => {
  const featuredCourses: Course[] = [
    {
      id: "1",
      title: "Investing In Stocks The Complete Course! (13 H...",
      image: "/assets/courses/course-img4.png",
      cost: "30,000.00",
      discountCost: "20,000",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      level: "Beginner",
      duration: "6 hours",
      category: {
        name: "Health & Fitness",
        bgColor: "#E1F7E3",
        textColor: "#15711F",
      },
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "2",
      title: "Google Analytics Certification - Learn How To...",
      image: "/assets/courses/course-img5.png",
      cost: "30,000.00",
      discountCost: "20,000",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      level: "Beginner",
      duration: "6 hours",
      category: {
        name: "Personal Development",
        bgColor: "#FFEEE8",
        textColor: "#993D20",
      },
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "3",
      title: "Adobe XD for Web Design: Essential Principles",
      image: "/assets/courses/course-img9.png",
      cost: "30,000.00",
      discountCost: "20,000",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      level: "Beginner",
      duration: "6 hours",
      category: {
        name: "Productivity",
        bgColor: "#F5F7FA",
        textColor: "#1D2026",
      },
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "4",
      title: "The Python Mega Course: Build 10 Real World ...",
      image: "/assets/courses/course-img7.png",
      cost: "30,000.00",
      discountCost: "20,000",
      instructor: {
        name: "Kevin Gilbert",
        photo: "/assets/courses/instructor-photo.png",
      },
      level: "Beginner",
      duration: "6 hours",
      category: {
        name: "Music",
        bgColor: "#FFF2E5",
        textColor: "#65390C",
      },
      rating: "5.0",
      numberOfReviews: "357,914",
      numberOfEnrolees: "265.7K",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-x-8 gap-y-2">
        <h4 className="text-3xl md:text-[32px] text-darkBlue-300 font-semibold w-full xl:w-1/2">
          Our Featured Courses
        </h4>

        <p className="text-xs text-[#4E5566] w-full xl:w-[35%]">
          Vestibulum sed dolor sed diam mollis maximus vel nec dolor. Donec
          varius purus et eleifend porta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featuredCourses.map((course) => (
          <div
            key={course.id}
            className="flex border border-[#E9EAF0] shadow-[0px_11.12px_29.65px_0px_#1D20261A] h-full w-full"
          >
            <div className="h-full w-[30%]">
              <Image
                src={course.image}
                alt="Course Image"
                width={250}
                height={300}
                className="object-cover h-full w-full"
              />
            </div>

            <div className="bg-white w-[70%]">
              <div className="space-y-2 px-5 py-3">
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                  <p
                    className="uppercase text-[8px] font-semibold p-1"
                    style={{
                      background: course.category.bgColor,
                      color: course.category.textColor,
                    }}
                  >
                    {course.category.name}
                  </p>

                  <p className="text-[10px] sm:text-xs md:text-sm text-darkBlue-300">
                    ₦{course.discountCost}{" "}
                    <span className="text-[10px] md:text-xs text-[#A1A5B3] line-through">
                      ₦{course.cost}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-darkBlue-300 line-clamp-2">
                    {course.title}
                  </p>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-y-1 pt-2">
                  <div className="flex justify-center items-center gap-2">
                    <Image
                      src={course.instructor!.photo}
                      alt="Instructor Photo"
                      width={50}
                      height={50}
                      className="h-4 sm:h-6 w-4 sm:w-6"
                    />

                    <p className="text-[10px] sm:text-xs text-[#4E5566] font-medium">
                      {course.instructor?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <p className="flex items-center gap-1 font-semibold text-darkBlue-300">
                      <span>
                        <Star fill="#FD8E1F" strokeWidth={0} size={16} />
                      </span>
                      {course.rating}
                    </p>

                    <p className="text-[#A1A5B3]">({course.numberOfReviews})</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-y-1 border-t border-[#E9EAF0] text-[#4E5566] text-[10px] sm:text-xs px-5 py-3 w-full">
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
                    <span className="font-normal text-[#8C94A3]">students</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/courses/level.png"
                    alt="User"
                    width={50}
                    height={50}
                    className="h-4 w-4"
                  />

                  <p className="font-medium">{course.level}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/courses/clock.png"
                    alt="User"
                    width={50}
                    height={50}
                    className="h-4 w-4"
                  />

                  <p className="font-medium">{course.duration}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FeaturedCourses;

import Image from "next/image";
import { Course } from "../page";
import { Star } from "lucide-react";

const BestSellingCourses = () => {
  const bestSellingCourses: Course[] = [
    {
      id: "1",
      title: "Machine Learning A-Z™: Hands-On Python & R In Data...",
      image: "/assets/courses/course-img1.png",
      cost: "5,700",
      category: {
        name: "Design",
        bgColor: "#FFEEE8",
        textColor: "#993D20",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "2",
      title: "The Complete 2021 Web Development Bootcamp",
      image: "/assets/courses/course-img2.png",
      cost: "8,000",
      category: {
        name: "Developments",
        bgColor: "#EBEBFF",
        textColor: "#342F98",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "3",
      title: "Learn Python Programming Masterclass",
      image: "/assets/courses/course-img3.png",
      cost: "6,600",
      category: {
        name: "Business",
        bgColor: "#E1F7E3",
        textColor: "#15711F",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "4",
      title: "The Complete Digital Marketing Course - 12 Courses in 1",
      image: "/assets/courses/course-img4.png",
      cost: "547,444",
      category: {
        name: "Marketing",
        bgColor: "#EBEBFF",
        textColor: "#342F98",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "5",
      title: "Reiki Level I, II and Master/Teacher Program",
      image: "/assets/courses/course-img5.png",
      cost: "33,222",
      category: {
        name: "IT & Software",
        bgColor: "#FFF0F0",
        textColor: "#882929",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "6",
      title: "The Complete Foundation Stock Trading Course",
      image: "/assets/courses/course-img6.png",
      cost: "3,457",
      category: {
        name: "Music",
        bgColor: "#FFF2E5",
        textColor: "#65390C",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "7",
      title: "Beginner to Pro in Excel: Financial Modeling and Valuati...",
      image: "/assets/courses/course-img7.png",
      cost: "120,000",
      category: {
        name: "Marketing",
        bgColor: "#EBEBFF",
        textColor: "#342F98",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "8",
      title: "The Python Mega Course: Build 10 Real World Applications",
      image: "/assets/courses/course-img8.png",
      cost: "33,890",
      category: {
        name: "Health & Fitness",
        bgColor: "#E1F7E3",
        textColor: "#15711F",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "9",
      title: "Copywriting - Become a Freelance Copywriter, your ow...",
      image: "/assets/courses/course-img9.png",
      cost: "5,411",
      category: {
        name: "Design",
        bgColor: "#FFEEE8",
        textColor: "#993D20",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
    {
      id: "10",
      title: "Google Analytics Certification - Learn How To Pass The Exam",
      image: "/assets/courses/course-img10.png",
      cost: "222,234",
      category: {
        name: "Lifestyle",
        bgColor: "#FFF2E5",
        textColor: "#65390C",
      },
      rating: "5.0",
      numberOfEnrolees: "265.7K",
    },
  ];

  return (
    <>
      <h4 className="text-center text-[32px] leading-10 text-darkBlue-300 font-semibold">
        Best Selling Courses
      </h4>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {bestSellingCourses.map((course) => (
          <div key={course.id} className="w-full">
            <div className="w-full">
              <Image
                src={course.image}
                alt="Course Image"
                width={400}
                height={300}
                className="object-contain w-full"
              />
            </div>

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
                  <span>
                    <Star fill="#FD8E1F" strokeWidth={0} size={16} />
                  </span>
                  {course.rating}
                </p>

                <p className="font-semibold">
                  {course.numberOfEnrolees}{" "}
                  <span className="font-normal text-[#8C94A3]">students</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BestSellingCourses;

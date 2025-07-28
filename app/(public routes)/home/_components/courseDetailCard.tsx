import Image from "next/image";
import { Course } from "../page";
import { Star } from "lucide-react";

const CourseDetailCard = ({ course }: { course: Course }) => {
  return (
    <>
      <div className="flex px-0 md:px-4">
        <p
          className="uppercase text-[8px] font-semibold p-1"
          style={{
            background: course.category.bgColor,
            color: course.category.textColor,
          }}
        >
          {course.category.name}
        </p>
      </div>

      <p className="text-[10px] sm:text-xs font-semibold text-darkBlue-300 line-clamp-2 px-0 md:px-4">
        {course.title}
      </p>

      <div className="flex justify-between items-center gap-2 px-0 md:px-4">
        <div className="flex justify-center items-center gap-2">
          <Image
            src={course.instructor!.photo}
            alt="Instructor Photo"
            width={50}
            height={50}
            className="h-8 w-8"
          />

          <p className="flex flex-col text-[10px] text-[#4E5566] font-medium">
            <span className="text-[#8C94A3] font-normal">Course by</span>
            {course.instructor?.name}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px]">
          <p className="flex items-center gap-1 font-semibold text-darkBlue-300">
            <span>
              <Star fill="#FD8E1F" strokeWidth={0} size={12} />
            </span>
            {course.rating}
          </p>

          <p className="text-[#A1A5B3]">({course.numberOfReviews})</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-y-1 text-[#4E5566] text-[10px] px-0 md:px-4 w-full">
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

      <div className="flex flex-wrap justify-between items-center px-0 md:px-4">
        <div className="flex justify-between items-center gap-2">
          <p className="flex items-center gap-1 text-sm text-darkBlue-300 font-medium">
            ₦{course.discountCost}{" "}
            <span className="text-[10px] text-[#A1A5B3] line-through">
              ₦{course.cost}
            </span>
          </p>

          <div className="flex">
            <p className="uppercase text-[8px] bg-[#FFEEE8] text-orange font-semibold p-1">
              {course.discount} OFF
            </p>
          </div>
        </div>

        <div className="bg-[#FFEEE8] p-1">
          <Image
            src="/assets/courses/heart.png"
            alt="heart"
            width={50}
            height={50}
            className="h-4 w-4"
          />
        </div>
      </div>

      <div className="space-y-2 text-[10px] border-y border-[#E9EAF0] px-0 md:px-4 py-3">
        <p className="text-darkBlue-300 font-medium">WHAT YOU&apos;LL LEARN</p>

        <ul className="space-y-2">
          {course.learningOutcomes?.map((item, index) => (
            <li key={index} className="flex gap-1 text-[#6E7485]">
              <Image
                src="/assets/courses/check.png"
                alt="check"
                width={50}
                height={50}
                className="h-4 w-4"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 px-0 md:px-4">
        <button className="flex justify-center items-center gap-2 bg-orange text-white font-semibold text-xs px-4 py-2 w-full">
          <Image
            src="/assets/courses/shopping_cart.png"
            alt="shopping_cart"
            width={50}
            height={50}
            className="h-4 w-4"
          />
          Add to Cart
        </button>

        <button className="bg-[#FFEEE8] text-orange text-xs font-semibold px-4 py-2 w-full">
          Course Detail
        </button>
      </div>
    </>
  );
};

export default CourseDetailCard;

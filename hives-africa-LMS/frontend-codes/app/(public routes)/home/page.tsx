"use client";

import Image from "next/image";
import FeaturedCourses from "./_components/featuredCourses";
import BestSellingCourses from "./_components/bestSellingCourses";
import RecentlyAddedCourses from "./_components/recentlyAddedCourses";

interface Category {
  name: string;
  icon: string;
  color: string;
  numberOfCourses: string;
}

export interface Course {
  id: string;
  title: string;
  image: string;
  cost: string;
  discountCost?: string;
  discount?: string;
  instructor?: {
    name: string;
    photo: string;
  };
  level?: string;
  duration?: string;
  category: {
    name: string;
    bgColor: string;
    textColor: string;
  };
  rating: string;
  numberOfReviews?: string;
  numberOfEnrolees: string;
  learningOutcomes?: string[];
}

const Home = () => {
  const categories: Category[] = [
    {
      name: "Label",
      icon: "/assets/categories/label-category.png",
      color: "#EBEBFF",
      numberOfCourses: "63,476",
    },
    {
      name: "Business",
      icon: "/assets/categories/business-category.png",
      color: "#E1F7E3",
      numberOfCourses: "52,822",
    },
    {
      name: "Finance & Accounting",
      icon: "/assets/categories/finance-category.png",
      color: "#FFF2E5",
      numberOfCourses: "33,841",
    },
    {
      name: "IT & Software",
      icon: "/assets/categories/software-category.png",
      color: "#FFF0F0",
      numberOfCourses: "22,649",
    },
    {
      name: "Personal Development",
      icon: "/assets/categories/personalDev-category.png",
      color: "#FFFFFF",
      numberOfCourses: "20,126",
    },
    {
      name: "Office Productivity",
      icon: "/assets/categories/officeProd-category.png",
      color: "#F5F7FA",
      numberOfCourses: "13,932",
    },
    {
      name: "Marketing",
      icon: "/assets/categories/marketing-category.png",
      color: "#EBEBFF",
      numberOfCourses: "12,068",
    },
    {
      name: "Photography & Video",
      icon: "/assets/categories/photography-category.png",
      color: "#F5F7FA",
      numberOfCourses: "6,196",
    },
    {
      name: "Lifestyle",
      icon: "/assets/categories/lifestyle-category.png",
      color: "#FFF2E5",
      numberOfCourses: "2,736",
    },
    {
      name: "Design",
      icon: "/assets/categories/design-category.png",
      color: "#FFEEE8",
      numberOfCourses: "2,600",
    },
    {
      name: "Health & Fitness",
      icon: "/assets/categories/health-category.png",
      color: "#E1F7E3",
      numberOfCourses: "1,678",
    },
    {
      name: "Music",
      icon: "/assets/categories/music-category.png",
      color: "#FFF2E5",
      numberOfCourses: "959",
    },
  ];

  return (
    <main className="-mb-16">
      <section className="flex flex-col lg:flex-row justify-between items-center gap-x-4 gap-y-12 bg-[linear-gradient(5.92deg,_#F9FAFB_6.98%,_#FEFEFF_95.46%)] px-4 md:px-16 py-8 lg:py-4 lg:pr-0 lg:pl-16 xl:pl-36 w-full">
        <div className="text-center lg:text-start space-y-4 w-full lg:w-[45%]">
          <h3 className="text-[38px] md:text-5xl text-[#303030] font-bold leading-12 md:leading-14">
            Learn with experts anytime, anywhere.
          </h3>
          <p className="text-sm md:text-base text-[#303030] leading-6">
            Join the next generation of African data leaders. Learn in-demand
            tech skills through culturally relevant content tailored for your
            journey.
          </p>
          <button className="bg-orange text-white text-xs md:text-sm font-medium px-6 py-3">
            Get Started for Free
          </button>
        </div>

        <div className="flex items-center w-full lg:w-[55%]">
          <Image
            src={"/assets/hive_africa_hero.png"}
            alt="Hero Image"
            width={400}
            height={400}
            className="object-contain w-full"
          />
        </div>
      </section>

      <section className="space-y-12 px-4 md:px-16 xl:px-36 py-16 lg:py-20 xl:py-24">
        <h4 className="text-center text-[32px] md:text-4xl leading-10 text-darkBlue-300 font-semibold">
          Browse Top Category
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`flex justify-between items-center gap-2 px-2 py-5 cursor-pointer w-full ${
                category.color === "#FFFFFF"
                  ? "shadow-[0px_11.12px_29.65px_0px_#1D20261A]"
                  : ""
              }`}
              style={{
                background: category.color,
              }}
            >
              <div className="flex justify-center items-center w-[30%]">
                <Image
                  src={category.icon}
                  alt="Category Icon"
                  width={60}
                  height={60}
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-2 w-[70%]">
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-[#6E7485]">
                  {category.numberOfCourses} Courses
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs md:text-sm text-[#6E7485] font-medium">
          We have more category & subcategory.{" "}
          <span className="text-orange cursor-pointer hover:underline">
            Browse All →
          </span>
        </p>
      </section>

      <section className="space-y-12 bg-[#F5F7FA] px-4 md:px-16 xl:px-36 pt-16 lg:pt-20 pb-68">
        <BestSellingCourses />
      </section>

      <section className="space-y-12 bg-white px-4 md:px-16 xl:px-36 pt-16 lg:pt-20 pb-25 sm:pb-30 lg:pb-35">
        <div className="bg-white space-y-8 border border-[#E9EAF0] rounded-2xl px-6 py-16 md:p-16 -mt-64">
          <FeaturedCourses />
        </div>

        <div className="flex flex-col items-center space-y-8 mx-auto w-full">
          <RecentlyAddedCourses />
        </div>
      </section>

      <section className="flex flex-col xl:flex-row justify-between items-stretch gap-8 bg-[#F5F7FA] px-4 md:px-16 xl:px-36 pt-16 lg:pt-20 pb-20 w-full">
        <div
          className="flex-1 px-8 pt-10 w-full xl:w-1/2"
          style={{
            background: "linear-gradient(90deg, #CC522B 0%, #FF6636 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white w-full md:w-[70%] space-y-4 md:space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold">
                Become an instructor
              </h2>

              <p className="text-xs md:text-sm">
                Instructors from around the world teach millions of students on
                your platform. We provide the tools and skills to teach what you
                love.
              </p>

              <button className="bg-white cursor-pointer text-orange font-semibold text-xs md:text-sm px-6 py-3 mt-2 mb-6 w-fit hover:bg-white/95 transition">
                Start Teaching →
              </button>
            </div>

            <div className="w-full md:w-[30%] hidden md:flex justify-center md:justify-end">
              <Image
                src={"/assets/Become_an_Instructor.png"}
                alt="Become an Instructor"
                width={500}
                height={500}
                className="w-full max-w-xs md:max-w-sm object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1 space-y-6 bg-white p-8 w-full xl:w-1/2">
          <p className="text-darkBlue-300 text-xl md:text-2xl font-semibold">
            Your teaching & earning steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                num: 1,
                text: "Apply to become instructor",
                bg: "#EBEBFF",
                color: "#564FFD",
              },
              {
                num: 2,
                text: "Build & edit your profile",
                bg: "#FFF0F0",
                color: "#FF6636",
              },
              {
                num: 3,
                text: "Create your new course",
                bg: "#FFF0F0",
                color: "#E34444",
              },
              {
                num: 4,
                text: "Start teaching & earning",
                bg: "#E1F7E3",
                color: "#23BD33",
              },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-4">
                <span
                  className="text-xs md:text-base font-semibold w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.num}
                </span>

                <p className="text-darkBlue-300 text-[10px] md:text-sm font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white px-4 md:px-16 xl:px-36 pt-16 lg:pt-20 pb-35 w-full">
        <div className="space-y-4 w-full lg:w-[30%]">
          <p className="font-semibold text-2xl text-darkBlue-300">
            Hive Africa, Trusted companies
          </p>

          <p className="text-xs text-[#6E7485] w-4/5">
            Nullam egestas tellus at enim ornare tristique. Class aptent taciti
            sociosqu ad litora torquent per conubia nostra.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full lg:w-[70%]">
          {[
            {
              id: "1",
              image: "/assets/netflix-logo.png",
            },
            {
              id: "2",
              image: "/assets/youtube-logo.png",
            },
            {
              id: "3",
              image: "/assets/google-logo.png",
            },
            {
              id: "4",
              image: "/assets/lenovo-logo.png",
            },
            {
              id: "5",
              image: "/assets/slack-logo.png",
            },
            {
              id: "6",
              image: "/assets/verizon-logo.png",
            },
            {
              id: "7",
              image: "/assets/lexmark-logo.png",
            },
            {
              id: "8",
              image: "/assets/microsoft-logo.png",
            },
          ].map((logo) => (
            <div
              key={logo.id}
              className="flex justify-center items-center bg-white shadow-[0px_0px_28.48px_0px_#091A4412] px-4"
            >
              <Image
                src={logo.image}
                alt="logo"
                width={100}
                height={100}
                className="h-20 w-20"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;

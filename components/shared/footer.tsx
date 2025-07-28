import Link from "next/link";
import React from "react";
import Image from "next/image";
interface FooterLink {
  title: string;
  href: string;
}
interface iconsProps {
  src: string;
  href: string;
  width: number;
  height: number;
}

const footerLinks: FooterLink[] = [
  {
    title: "School of Artificial Intelligence",
    href: "/",
  },
  {
    title: "School of Data Science",
    href: "/",
  },
  {
    title: "School of Programming",
    href: "/",
  },
  {
    title: "School of Cloud Computing",
    href: "/",
  },
  {
    title: "School of Cyber Security",
    href: "/",
  },
  {
    title: "School of Digital Marketing",
    href: "/",
  },
];

const programs: FooterLink[] = [
  {
    title: "Business Analytics",
    href: "/",
  },
  {
    title: "SQL",
    href: "/",
  },
  {
    title: "Cloud Architect",
    href: "/",
  },
  {
    title: "Robotics",
    href: "/",
  },
  {
    title: "Self Driving Cars",
    href: "/",
  },
  {
    title: "AWS",
    href: "/",
  },
];

const company: FooterLink[] = [
  {
    title: "About Us",
    href: "/",
  },
  {
    title: "Why Hive?",
    href: "/",
  },
  {
    title: "Blog",
    href: "/",
  },
  {
    title: "Jobs at the Hive",
    href: "/",
  },
  {
    title: "Partner with Analytix Hive",
    href: "/",
  },
  {
    title: "Resources",
    href: "/",
  },
];

const quickLinks: FooterLink[] = [
  {
    title: "Privacy Policy",
    href: "/",
  },
  {
    title: "Terms of Use",
    href: "/",
  },
  {
    title: "Security",
    href: "/",
  },
  {
    title: "Privacy FAQs",
    href: "/",
  },
  {
    title: "DPA",
    href: "/",
  },
  {
    title: "Sitemap",
    href: "/",
  },
  {
    title: "Cookies Preference",
    href: "/",
  },
];

const icons: iconsProps[] = [
  {
    src: "/assets/flogo.png",
    href: "/",
    width: 30,
    height: 30,
  },
  {
    src: "/assets/xlogo.png",
    href: "/",
    width: 30,
    height: 30,
  },
  {
    src: "/assets/linkedinlogo.png",
    href: "/",
    width: 30,
    height: 30,
  },
];

const Footer = () => {
  return (
    <>
      <div className="flex flex-col gap-8 sm:gap-16 bg-darkBlue-500 rounded-t-[64px] text-white px-8 sm:px-16 xl:px-32 pt-20 pb-12 w-full">
        <main className="flex flex-col lg:flex-row justify-start items-start gap-12 sm:gap-16 xl:gap-24">
          <section className="flex flex-col gap-4 w-full lg:w-1/4">
            <Image
              src={"/assets/Analytix Hive Logo 3.png"}
              alt="Analytix Logo"
              width={80}
              height={80}
            />
            <h1 className="text-xl xl:text-2xl">
              Transforming Learning in Africa
            </h1>
            <p className="text-sm xl:text-base">Follow us</p>

            <div className="flex gap-4">
              {icons.map((icon, index) => (
                <Link href={icon.href} key={index}>
                  <Image
                    src={icon.src}
                    width={icon.width}
                    height={icon.height}
                    alt="logos"
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col sm:flex-row justify-between items-start gap-8 w-full lg:w-3/4">
            <section className="flex flex-col gap-4">
              <h1 className=" text-lg xl:text-xl">Analytix Hive Schools</h1>
              <ul className="flex flex-col gap-2 text-white/50">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm xl:text-base">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h1 className="text-lg xl:text-xl">Featured Programs</h1>
              <ul className="flex flex-col gap-2 text-white/50">
                {programs.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm xl:text-base">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h1 className="text-lg xl:text-xl">Company</h1>
              <ul className="flex flex-col gap-2 text-white/50">
                {company.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm xl:text-base">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </main>

        <section className="flex flex-col lg:flex-row gap-4 lg:gap-16 xl:gap-24 border-t border-white/10 pt-4 w-full">
          <p className="text-xs xl:text-sm text-white/50 w-full lg:w-1/4">
            Copyright Analytix Hive 2025
          </p>

          <ul className="flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-2 text-white/70 w-full lg:w-3/4">
            {quickLinks.map((link, index) => (
              <li key={index} className="inline-flex">
                <Link href={link.href} className="text-xs xl:text-sm">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Footer;

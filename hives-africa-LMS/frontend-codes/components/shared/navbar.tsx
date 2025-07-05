"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Handles closing mobile menu when outside the menu is clicked
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="w-full bg-white text-sm">
      <div className="mx-auto px-4 md:px-16 py-4 md:py-6 flex justify-between items-center gap-8 w-full">
        <div className="flex items-center gap-12 xl:gap-24 w-[70%]">
          <Link href="/">
            <Image
              src={"/assets/Analytix Hive Logo 3.png"}
              alt="Analytix Logo"
              width={70}
              height={70}
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8 text-base text-[#151A28] font-medium">
            <li>
              <Link href="/" className="hover:text-yellow transition">
                Why Analytix
              </Link>
            </li>

            <li>
              <Link href="/" className="hover:text-yellow transition">
                Solutions
              </Link>
            </li>

            <li>
              <Link href="/" className="hover:text-yellow transition">
                Pricing
              </Link>
            </li>

            <li className="flex items-center gap-1 cursor-pointer group hover:text-yellow transition">
              <span>Resources</span>
              <ChevronDown className="text-[#151A28] group-hover:text-yellow w-4 h-4" />
            </li>
          </ul>
        </div>

        {/* Desktop auth links + hamburger icon */}
        <div className="flex items-center gap-4 md:w-[30%] justify-end">
          <ul className="flex justify-end items-center gap-4">
            <li>
              <Link
                href="/auth"
                className="bg-[#3086EE1A] text-darkBlue-500 text-sm lg:text-base font-semibold px-6 py-3 rounded-full hover:bg-[#3086EE2A] transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/auth"
                className="bg-yellow text-white text-sm lg:text-base font-semibold px-6 py-3 rounded-full hover:bg-yellow/80 transition-colors"
              >
                Signup
              </Link>
            </li>
          </ul>

          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 z-50 bg-darkBlue-500/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out h-screen overflow-hidden flex flex-col justify-start items-start gap-12 py-4 w-72 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 w-full">
          <Link href="/">
            <Image
              src={"/assets/Analytix Hive Logo 3.png"}
              alt="Analytix Logo"
              width={70}
              height={70}
            />
          </Link>
        </div>

        <div className="px-4">
          <ul className="flex flex-col gap-8 text-sm text-white">
            <li>
              <Link href="/" className="active:text-yellow transition">
                Why Analytix
              </Link>
            </li>

            <li>
              <Link href="/" className="active:text-yellow transition">
                Solutions
              </Link>
            </li>

            <li>
              <Link href="/" className="active:text-yellow transition">
                Pricing
              </Link>
            </li>

            <li className="flex items-center gap-1 cursor-pointer group active:text-yellow transition">
              <span>Resources</span>
              <ChevronDown className="text-[#384957] group-hover:text-yellow w-4 h-4" />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

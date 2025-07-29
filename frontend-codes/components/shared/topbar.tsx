import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <div className="w-full bg-darkBlue-500 text-white text-xs sm:text-sm">
      <div className="mx-auto px-4 md:px-16 py-4 flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
        <div className="flex items-center gap-1 cursor-pointer group hover:text-yellow transition">
          <span>Become a partner</span>
          <ChevronDown className="text-[#384957] group-hover:text-yellow w-4 h-4" />
        </div>

        <div className="flex items-center gap-1 cursor-pointer group hover:text-yellow transition">
          <span>Company</span>
          <ChevronDown className="text-[#384957] group-hover:text-yellow w-4 h-4" />
        </div>

        <Link href="/contact" className="hover:text-yellow transition">
          Contact Us
        </Link>

        <span className="bg-[#384957] px-2 py-1 rounded-full text-xs">
          +1 888 240 6923
        </span>

        <Link href="/auth" className="hover:text-yellow transition">
          Login
        </Link>

        <div className="flex items-center gap-1 cursor-pointer group hover:text-yellow transition">
          <span>EN</span>
          <ChevronDown className="text-[#384957] group-hover:text-yellow w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

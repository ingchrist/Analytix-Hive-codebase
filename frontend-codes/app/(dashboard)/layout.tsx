
import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, ShoppingCart, Heart, BarChart3, HelpCircle, Settings, CreditCard } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <div className="w-64 border-r bg-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            <nav className="space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Courses
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/learning">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Learning
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/achievements">
                  <Trophy className="mr-2 h-4 w-4" />
                  Achievements
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/wishlist">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/purchases">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchases
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/student/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </Link>
              </Button>
            </nav>
          </div>
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

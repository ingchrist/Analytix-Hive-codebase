import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import Topbar from "@/components/shared/topbar";

export const metadata = {
  title: "Hive Africa | Home",
  description: "A platform for online courses and learning",
  generator: "Analytix-hive",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Topbar />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

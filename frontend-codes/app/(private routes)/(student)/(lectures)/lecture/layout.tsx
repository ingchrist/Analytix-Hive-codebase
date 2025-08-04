import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Lecture Learning Platform",
  description: "A platform for lecture content and learning",
  generator: "Analytix-hive",
};

export default function LectureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      {children}
      <Footer />
    </main>
  );
}

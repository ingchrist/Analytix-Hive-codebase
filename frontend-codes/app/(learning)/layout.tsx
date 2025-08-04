
import Footer from "@/components/shared/footer";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
      <Footer />
    </div>
  );
}

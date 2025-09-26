import FeaturesSection from "@/app/[locale]/FeaturesSection";
import HeroSection from "@/app/[locale]/HeroSection";
import Footer from "@/app/[locale]/Footer";
import ReadySection from "@/app/[locale]/ReadySection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ReadySection />
      <Footer />
    </div>
  );
}

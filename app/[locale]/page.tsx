import FeaturesSection from "@/app/[locale]/FeaturesSection";
import HeroSection from "@/app/[locale]/HeroSection";
import Footer from "@/app/[locale]/Footer";
import ReadySection from "@/app/[locale]/ReadySection";
import PopularCategories from "@/app/[locale]/PopularCategories";
import FAQSection from "@/app/[locale]/pricing/FAQSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <PopularCategories />
      <ReadySection />
      <FAQSection />
      <Footer />
    </div>
  );
}

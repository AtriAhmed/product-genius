import Footer from "@/app/[locale]/Footer";
import FAQSection from "@/app/[locale]/pricing/FAQSection";
import Plans from "@/app/[locale]/pricing/Plans";
import React from "react";

export default function page() {
  return (
    <div>
      <Plans />
      <FAQSection />
      <Footer />
    </div>
  );
}

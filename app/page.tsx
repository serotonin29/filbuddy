import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhySection } from "@/components/WhySection";
import { HowItWorks } from "@/components/HowItWorks";
import { SkillCatalog } from "@/components/SkillCatalog";
import { PointCalculator } from "@/components/PointCalculator";
import { Testimonials } from "@/components/Testimonials";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-16 bg-slate-50 flex flex-col">
        <Hero />
        <div className="flex flex-col w-full min-w-0">
          <WhySection />
          <HowItWorks />
          <SkillCatalog />
          <PointCalculator />
          <Testimonials />
          <CtaBanner />
        </div>
      </main>
      <Footer />
    </>
  );
}

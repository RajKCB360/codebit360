import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Courses } from "@/components/Courses";
import { Internships } from "@/components/Internships";
import { Services } from "@/components/Services";
import { TargetAudience } from "@/components/TargetAudience";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Courses />
      <Internships />
      <Services />
      <TargetAudience />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;

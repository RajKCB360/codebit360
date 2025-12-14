import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-indigo/20 to-brand-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Start Your Journey Today
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Ready to{" "}
            <span className="gradient-text">Level Up</span> Your Career?
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 10,000+ students who are learning industry-ready skills, gaining
            real experience, and landing their dream jobs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Talk to an Advisor
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free courses available • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Linkedin, MessageSquare, Users, ArrowRight, Check } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Resume Review",
    description: "Get expert feedback on your resume with actionable suggestions to improve it.",
    price: "₹299",
    features: ["Detailed analysis", "ATS optimization tips", "48-hour delivery"],
    popular: false,
  },
  {
    icon: FileText,
    title: "Resume Rewrite",
    description: "Complete resume makeover by professional career experts.",
    price: "₹499",
    features: ["Full rewrite", "Modern formatting", "2 revision rounds"],
    popular: true,
  },
  {
    icon: Linkedin,
    title: "LinkedIn Optimization",
    description: "Optimize your LinkedIn profile to attract recruiters and opportunities.",
    price: "₹399",
    features: ["Profile audit", "Headline optimization", "Keyword strategy"],
    popular: false,
  },
  {
    icon: MessageSquare,
    title: "Mock Interview",
    description: "Practice with industry experts and get personalized feedback.",
    price: "₹999",
    features: ["1-on-1 session", "Real questions", "Detailed feedback"],
    popular: false,
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
          >
            Career Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Boost Your{" "}
            <span className="gradient-text">Career Prospects</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Professional resume writing, LinkedIn optimization, and interview
            preparation services to help you land your dream job.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group p-6 lg:p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl ${
                service.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <service.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">
                {service.description}
              </p>

              <div className="text-3xl font-bold text-foreground mb-6">
                {service.price}
              </div>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={service.popular ? "hero" : "outline"}
                className="w-full"
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

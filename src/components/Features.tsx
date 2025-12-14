import { motion } from "framer-motion";
import { Code, Briefcase, FileText, Users, Award, Rocket } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Practical Coding Projects",
    description: "Build real-world applications with hands-on projects that prepare you for industry challenges.",
    color: "brand-indigo",
  },
  {
    icon: Briefcase,
    title: "Certified Internships",
    description: "Gain work experience through our structured virtual internship programs with real tasks.",
    color: "brand-cyan",
  },
  {
    icon: FileText,
    title: "Resume & LinkedIn Support",
    description: "Get professional help crafting a standout resume and optimizing your LinkedIn profile.",
    color: "brand-purple",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Learn from industry professionals who guide you through your career journey.",
    color: "brand-orange",
  },
  {
    icon: Award,
    title: "Industry Certifications",
    description: "Earn certificates recognized by top companies to validate your skills.",
    color: "brand-green",
  },
  {
    icon: Rocket,
    title: "Affordable Pricing",
    description: "Student-friendly pricing designed to make quality education accessible to everyone.",
    color: "brand-indigo",
  },
];

const iconColors: Record<string, string> = {
  "brand-indigo": "bg-brand-indigo/10 text-brand-indigo",
  "brand-cyan": "bg-brand-cyan/10 text-brand-cyan",
  "brand-purple": "bg-brand-purple/10 text-brand-purple",
  "brand-orange": "bg-brand-orange/10 text-brand-orange",
  "brand-green": "bg-brand-green/10 text-brand-green",
};

export const Features = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
          >
            Why CodeBit360?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            We combine practical learning, real experience, and career support to
            help you land your dream tech job.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div
                className={`w-14 h-14 rounded-xl ${iconColors[feature.color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

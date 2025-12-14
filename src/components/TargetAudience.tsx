import { motion } from "framer-motion";
import { GraduationCap, Code, Database, Cloud, Brain } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "B.Tech Students",
    description: "Computer Science, IT, and Electronics students preparing for placements.",
  },
  {
    icon: Code,
    title: "BCA/MCA Students",
    description: "Looking to build practical skills alongside academic knowledge.",
  },
  {
    icon: Database,
    title: "Data Enthusiasts",
    description: "Students interested in Data Science, Analytics, and AI/ML careers.",
  },
  {
    icon: Cloud,
    title: "Cloud Learners",
    description: "Aspiring cloud engineers and DevOps professionals.",
  },
  {
    icon: Brain,
    title: "Freshers & Job Seekers",
    description: "Recent graduates looking to break into the tech industry.",
  },
];

export const TargetAudience = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
            >
              Who We Serve
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            >
              Built for{" "}
              <span className="gradient-text">Ambitious Students</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Whether you're a first-year student exploring tech or a final-year
              student preparing for placements, CodeBit360 has resources tailored
              for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {audiences.slice(0, 3).map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Stats/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500+", label: "Partner Colleges" },
                  { value: "10K+", label: "Students Trained" },
                  { value: "85%", label: "Placement Rate" },
                  { value: "50+", label: "Industry Mentors" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4">
                    <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple border-2 border-card flex items-center justify-center text-primary-foreground text-xs font-semibold"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">1,200+</span>{" "}
                    students joined this month
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-cyan/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-brand-indigo/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

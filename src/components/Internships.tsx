import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, FileCheck, ArrowRight } from "lucide-react";

const internships = [
  {
    title: "Software Developer Intern",
    duration: "8 weeks",
    tasks: ["Build REST APIs", "Database design", "Code reviews"],
    certificate: true,
    price: "₹999",
    color: "brand-indigo",
  },
  {
    title: "Python Developer Intern",
    duration: "6 weeks",
    tasks: ["Python scripting", "Data processing", "Automation"],
    certificate: true,
    price: "₹799",
    color: "brand-cyan",
  },
  {
    title: "Web Developer Intern",
    duration: "8 weeks",
    tasks: ["Frontend development", "Responsive design", "React projects"],
    certificate: true,
    price: "₹999",
    color: "brand-purple",
  },
  {
    title: "Cloud/DevOps Intern",
    duration: "6 weeks",
    tasks: ["AWS basics", "CI/CD pipelines", "Docker containers"],
    certificate: true,
    price: "₹1,199",
    color: "brand-orange",
  },
  {
    title: "Data Analyst Intern",
    duration: "6 weeks",
    tasks: ["Data visualization", "SQL queries", "Report generation"],
    certificate: true,
    price: "₹899",
    color: "brand-green",
  },
];

const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
  "brand-indigo": {
    bg: "bg-brand-indigo/5",
    border: "border-brand-indigo/20 hover:border-brand-indigo/50",
    icon: "bg-brand-indigo/10 text-brand-indigo",
  },
  "brand-cyan": {
    bg: "bg-brand-cyan/5",
    border: "border-brand-cyan/20 hover:border-brand-cyan/50",
    icon: "bg-brand-cyan/10 text-brand-cyan",
  },
  "brand-purple": {
    bg: "bg-brand-purple/5",
    border: "border-brand-purple/20 hover:border-brand-purple/50",
    icon: "bg-brand-purple/10 text-brand-purple",
  },
  "brand-orange": {
    bg: "bg-brand-orange/5",
    border: "border-brand-orange/20 hover:border-brand-orange/50",
    icon: "bg-brand-orange/10 text-brand-orange",
  },
  "brand-green": {
    bg: "bg-brand-green/5",
    border: "border-brand-green/20 hover:border-brand-green/50",
    icon: "bg-brand-green/10 text-brand-green",
  },
};

export const Internships = () => {
  return (
    <section id="internships" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
          >
            Virtual Internships
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Gain Real{" "}
            <span className="gradient-text">Work Experience</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Task-based virtual internships with industry-standard practices. Complete
            projects, get mentored, and earn verified certificates.
          </motion.p>
        </div>

        {/* Internships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {internships.map((internship, index) => {
            const colors = colorClasses[internship.color];
            return (
              <motion.div
                key={internship.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group p-6 lg:p-8 rounded-2xl ${colors.bg} border ${colors.border} transition-all duration-300 hover:shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center mb-6`}>
                  <FileCheck className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4">
                  {internship.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{internship.duration}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {internship.tasks.map((task) => (
                    <li key={task} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>

                {internship.certificate && (
                  <div className="flex items-center gap-2 text-sm text-brand-green font-medium mb-6">
                    <span>✓</span> Certificate on completion
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-xl font-bold text-foreground">
                    {internship.price}
                  </span>
                  <Button size="sm" variant="default">
                    Apply Now
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="heroOutline" size="lg">
            View All Internships
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

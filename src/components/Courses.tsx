import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, BarChart, Star, ArrowRight } from "lucide-react";

const courses = [
  {
    title: "Python for Developers",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.9,
    students: "2.5K",
    price: "Free",
    image: "🐍",
    tags: ["Python", "Backend", "Data"],
  },
  {
    title: "Full Stack Web Development",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.8,
    students: "3.2K",
    price: "₹1,999",
    image: "🌐",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    title: "SQL & Database Fundamentals",
    level: "Beginner",
    duration: "6 weeks",
    rating: 4.7,
    students: "1.8K",
    price: "₹999",
    image: "🗄️",
    tags: ["SQL", "PostgreSQL", "Database"],
  },
  {
    title: "Cloud Computing Basics",
    level: "Intermediate",
    duration: "8 weeks",
    rating: 4.9,
    students: "1.5K",
    price: "₹1,499",
    image: "☁️",
    tags: ["AWS", "Azure", "DevOps"],
  },
  {
    title: "DevOps Fundamentals",
    level: "Intermediate",
    duration: "10 weeks",
    rating: 4.8,
    students: "1.2K",
    price: "₹1,799",
    image: "⚙️",
    tags: ["Docker", "CI/CD", "Kubernetes"],
  },
  {
    title: "Data Structures & Algorithms",
    level: "Advanced",
    duration: "12 weeks",
    rating: 4.9,
    students: "2.8K",
    price: "₹2,499",
    image: "🧮",
    tags: ["DSA", "Problem Solving", "Interview"],
  },
];

const levelColors: Record<string, string> = {
  Beginner: "bg-brand-green/10 text-brand-green",
  Intermediate: "bg-brand-orange/10 text-brand-orange",
  Advanced: "bg-brand-purple/10 text-brand-purple",
};

export const Courses = () => {
  return (
    <section id="courses" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
          >
            Our Courses
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Master In-Demand{" "}
            <span className="gradient-text">Tech Skills</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Industry-focused courses designed by experts to help you become
            job-ready faster.
          </motion.p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
            >
              {/* Course Image */}
              <div className="aspect-video bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 flex items-center justify-center text-6xl">
                {course.image}
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[course.level]}`}>
                    {course.level}
                  </span>
                  {course.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-brand-orange fill-brand-orange" />
                    {course.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart className="w-4 h-4" />
                    {course.students}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className={`text-xl font-bold ${course.price === "Free" ? "text-brand-green" : "text-foreground"}`}>
                    {course.price}
                  </span>
                  <Button size="sm" variant="default">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="heroOutline" size="lg">
            View All Courses
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

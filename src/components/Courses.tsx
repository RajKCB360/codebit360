import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  price: number | null;
  is_free: boolean | null;
  image_url: string | null;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-brand-green/10 text-brand-green",
  Intermediate: "bg-brand-orange/10 text-brand-orange",
  Advanced: "bg-brand-purple/10 text-brand-purple",
};

const levelEmojis: Record<string, string> = {
  Beginner: "🌱",
  Intermediate: "🚀",
  Advanced: "⚡",
};

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-10 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Courses Coming Soon</h3>
            <p className="text-muted-foreground">
              We're preparing exciting courses for you. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-full">
                    {/* Course Image */}
                    <div className="aspect-video bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 flex items-center justify-center text-6xl">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        levelEmojis[course.level || "Beginner"] || "📚"
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[course.level || "Beginner"]}`}>
                          {course.level || "Beginner"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Course
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className={`text-xl font-bold ${course.is_free ? "text-brand-green" : "text-foreground"}`}>
                          {course.is_free ? "Free" : `₹${course.price}`}
                        </span>
                        <Button size="sm" variant="default">
                          View Course
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="heroOutline" size="lg" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

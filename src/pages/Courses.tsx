import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Search, BookOpen, Star, ArrowRight, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  price: number | null;
  is_free: boolean | null;
  is_active: boolean | null;
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

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <>
      <SEO
        title="Tech Courses | CodeBit360 - Learn Programming & Development"
        description="Explore industry-focused coding courses in Python, Web Development, SQL, Cloud Computing, DevOps, and more. Get job-ready with expert-led training."
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 via-background to-brand-purple/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                🎓 Learn & Grow
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Master In-Demand{" "}
                <span className="gradient-text">Tech Skills</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Industry-focused courses designed by experts to help you become job-ready faster.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLevel === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(null)}
                >
                  All Levels
                </Button>
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                  >
                    {levelEmojis[level]} {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-4" />
                    <div className="h-10 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search" : "Check back soon for new courses!"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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

                          {course.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {course.description}
                            </p>
                          )}

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
                              Chapters
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className={`text-xl font-bold ${course.is_free ? "text-brand-green" : "text-foreground"}`}>
                              {course.is_free ? "Free" : `₹${course.price}`}
                            </span>
                            <Button size="sm" variant="default">
                              View Course
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Courses;

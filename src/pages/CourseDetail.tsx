import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Clock, BookOpen, GraduationCap, ChevronRight, Play, 
  CheckCircle, ArrowLeft, Lock, ExternalLink 
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  link?: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  price: number | null;
  is_free: boolean | null;
  image_url: string | null;
  syllabus: unknown;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-brand-green/10 text-brand-green border-brand-green/20",
  Intermediate: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  Advanced: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCourse(data);
      
      // Parse syllabus for chapters
      if (data.syllabus && Array.isArray(data.syllabus)) {
        setChapters(data.syllabus as unknown as Chapter[]);
      }

      // Fetch related courses
      const { data: related } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .eq("level", data.level)
        .neq("id", id)
        .limit(3);

      if (related) {
        setRelatedCourses(related);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Course not found");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .single();

    setIsEnrolled(!!data);
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      navigate("/auth");
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: id,
          status: "active",
        });

      if (error) throw error;
      
      setIsEnrolled(true);
      toast.success("Successfully enrolled in the course!");
    } catch (error: any) {
      console.error("Error enrolling:", error);
      if (error.code === "23505") {
        toast.info("You are already enrolled in this course");
        setIsEnrolled(true);
      } else {
        toast.error("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const getTotalDuration = () => {
    if (!chapters.length) return course?.duration || "Self-paced";
    
    let totalMinutes = 0;
    chapters.forEach((chapter) => {
      if (chapter.duration) {
        const match = chapter.duration.match(/(\d+)/);
        if (match) {
          totalMinutes += parseInt(match[1]);
        }
      }
    });

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded w-2/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <>
      <SEO
        title={`${course.title} | CodeBit360 Courses`}
        description={course.description || `Learn ${course.title} with CodeBit360's comprehensive course.`}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Breadcrumb */}
        <div className="pt-20 pb-4 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium truncate">{course.title}</span>
            </div>
          </div>
        </div>

        {/* Course Header */}
        <section className="py-8 lg:py-12 bg-gradient-to-br from-primary/5 via-background to-brand-purple/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link to="/courses">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Courses
                    </Link>
                  </Button>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${levelColors[course.level || "Beginner"]}`}>
                      {course.level || "Beginner"}
                    </span>
                    {course.is_free && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
                        Free
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                    {course.title}
                  </h1>

                  {course.description && (
                    <p className="text-lg text-muted-foreground mb-6">
                      {course.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{getTotalDuration()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{chapters.length} Chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span>Certificate Included</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="sticky top-24">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 rounded-lg flex items-center justify-center text-6xl mb-6">
                        {course.image_url ? (
                          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          "📚"
                        )}
                      </div>

                      <div className="text-center mb-6">
                        <span className={`text-3xl font-bold ${course.is_free ? "text-brand-green" : "text-foreground"}`}>
                          {course.is_free ? "Free" : `₹${course.price}`}
                        </span>
                      </div>

                      {isEnrolled ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-brand-green mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Enrolled</span>
                          </div>
                          {chapters.length > 0 && (
                            <Button asChild className="w-full" size="lg">
                              <Link to={`/courses/${course.id}/chapter/${chapters[0].id}`}>
                                <Play className="w-5 h-5 mr-2" />
                                Start Learning
                              </Link>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      )}

                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Lifetime access to all course materials
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Curriculum */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Course Curriculum</h2>

            {chapters.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Course content is being prepared. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {isEnrolled ? (
                      <Link to={`/courses/${course.id}/chapter/${chapter.id}`}>
                        <Card className="hover:border-primary/30 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {chapter.title}
                              </h3>
                              {chapter.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {chapter.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {chapter.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {chapter.duration}
                                </span>
                              )}
                              <Play className="w-5 h-5 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ) : (
                      <Card className="opacity-75">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {chapter.title}
                            </h3>
                            {chapter.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {chapter.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {chapter.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {chapter.duration}
                              </span>
                            )}
                            <Lock className="w-5 h-5" />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="py-12 lg:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Courses</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((relCourse) => (
                  <Link key={relCourse.id} to={`/courses/${relCourse.id}`}>
                    <Card className="h-full hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 rounded-lg flex items-center justify-center text-4xl mb-4">
                          {relCourse.image_url ? (
                            <img src={relCourse.image_url} alt={relCourse.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            "📚"
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${levelColors[relCourse.level || "Beginner"]} mb-2`}>
                          {relCourse.level}
                        </span>
                        <h3 className="font-semibold text-foreground mb-2">{relCourse.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${relCourse.is_free ? "text-brand-green" : "text-foreground"}`}>
                            {relCourse.is_free ? "Free" : `₹${relCourse.price}`}
                          </span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default CourseDetail;

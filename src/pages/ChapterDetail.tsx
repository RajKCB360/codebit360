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
  Clock, BookOpen, ChevronRight, ChevronLeft, Play, 
  ArrowLeft, ExternalLink, CheckCircle, Lock
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
  syllabus: unknown;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-brand-green/10 text-brand-green",
  Intermediate: "bg-brand-orange/10 text-brand-orange",
  Advanced: "bg-brand-purple/10 text-brand-purple",
};

const ChapterDetail = () => {
  const { id: courseId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourseAndChapter();
      if (user) {
        checkEnrollment();
      }
    }
  }, [courseId, chapterId, user]);

  const fetchCourseAndChapter = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;
      setCourse(data);
      
      // Parse syllabus for chapters
      if (data.syllabus && Array.isArray(data.syllabus)) {
        const chaptersData = data.syllabus as unknown as Chapter[];
        setChapters(chaptersData);
        
        // Find current chapter
        const chapter = chaptersData.find((c) => c.id === chapterId);
        if (chapter) {
          setCurrentChapter(chapter);
        } else {
          toast.error("Chapter not found");
          navigate(`/courses/${courseId}`);
        }
      }

      // Fetch related courses
      const { data: related } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .eq("level", data.level)
        .neq("id", courseId)
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
    if (!user || !courseId) return;
    
    const { data } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!data) {
      toast.error("Please enroll in this course first");
      navigate(`/courses/${courseId}`);
    } else {
      setIsEnrolled(true);
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex((c) => c.id === chapterId);
  };

  const getPreviousChapter = () => {
    const index = getCurrentChapterIndex();
    return index > 0 ? chapters[index - 1] : null;
  };

  const getNextChapter = () => {
    const index = getCurrentChapterIndex();
    return index < chapters.length - 1 ? chapters[index + 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded w-2/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course || !currentChapter || !isEnrolled) {
    return null;
  }

  const prevChapter = getPreviousChapter();
  const nextChapter = getNextChapter();

  return (
    <>
      <SEO
        title={`${currentChapter.title} | ${course.title} | CodeBit360`}
        description={currentChapter.description || `Learn ${currentChapter.title} in the ${course.title} course.`}
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
              <Link to={`/courses/${courseId}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {course.title}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium truncate">{currentChapter.title}</span>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link to={`/courses/${courseId}`}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Course
                    </Link>
                  </Button>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Chapter {getCurrentChapterIndex() + 1} of {chapters.length}
                    </span>
                    {currentChapter.duration && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {currentChapter.duration}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                    {currentChapter.title}
                  </h1>

                  {/* Video/Content Area */}
                  <Card className="mb-8">
                    <CardContent className="p-0">
                      {currentChapter.link ? (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          {currentChapter.link.includes("youtube.com") || currentChapter.link.includes("youtu.be") ? (
                            <iframe
                              src={currentChapter.link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10">
                              <div className="text-center">
                                <Play className="w-16 h-16 mx-auto text-primary mb-4" />
                                <Button asChild>
                                  <a href={currentChapter.link} target="_blank" rel="noopener noreferrer">
                                    Open Content
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Content coming soon</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Chapter Description */}
                  {currentChapter.description && (
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                      <h2 className="text-xl font-semibold mb-4">About This Chapter</h2>
                      <p className="text-muted-foreground">{currentChapter.description}</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-8 border-t border-border">
                    {prevChapter ? (
                      <Button variant="outline" asChild>
                        <Link to={`/courses/${courseId}/chapter/${prevChapter.id}`}>
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous: {prevChapter.title}
                        </Link>
                      </Button>
                    ) : (
                      <div />
                    )}
                    
                    {nextChapter ? (
                      <Button asChild>
                        <Link to={`/courses/${courseId}/chapter/${nextChapter.id}`}>
                          Next: {nextChapter.title}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="default">
                        <Link to={`/courses/${courseId}`}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Course
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar - Chapter List */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="sticky top-24">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-4">Course Chapters</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                          <Link
                            key={chapter.id}
                            to={`/courses/${courseId}/chapter/${chapter.id}`}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              chapter.id === chapterId
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              chapter.id === chapterId
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                chapter.id === chapterId ? "text-primary" : "text-foreground"
                              }`}>
                                {chapter.title}
                              </p>
                              {chapter.duration && (
                                <p className="text-xs text-muted-foreground">{chapter.duration}</p>
                              )}
                            </div>
                            {chapter.id === chapterId && (
                              <Play className="w-4 h-4" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
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
                          📚
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${levelColors[relCourse.level || "Beginner"]} mb-2`}>
                          {relCourse.level}
                        </span>
                        <h3 className="font-semibold text-foreground mb-2">{relCourse.title}</h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
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

export default ChapterDetail;

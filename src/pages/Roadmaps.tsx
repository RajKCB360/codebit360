import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Map, Download, Eye, Filter, BookOpen, TrendingUp } from "lucide-react";

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  preview_url: string | null;
  download_url: string | null;
  view_count: number;
  created_at: string;
}

const CATEGORIES = ["All", "AI", "Web Development", "Data Science", "DevOps", "Cloud", "Python", "Machine Learning", "Cybersecurity", "Mobile Development"];
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];

const Roadmaps = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [previewRoadmap, setPreviewRoadmap] = useState<Roadmap | null>(null);

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("is_active", true)
        .order("view_count", { ascending: false });
      if (error) throw error;
      return data as Roadmap[];
    },
  });

  const handlePreview = (roadmap: Roadmap) => {
    setPreviewRoadmap(roadmap);
  };

  const filteredRoadmaps = roadmaps?.filter((roadmap) => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || roadmap.category === selectedCategory;
    const matchesLevel = selectedLevel === "All Levels" || roadmap.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-500/10 text-green-500";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "Advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Career Roadmaps | CodeBit360"
        description="Explore comprehensive career roadmaps for AI, Web Development, Data Science, DevOps, and more. Step-by-step guides to land your dream tech job."
        keywords="career roadmap, tech career path, AI roadmap, web developer roadmap, data science roadmap"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              <Map className="h-3 w-3 mr-1" />
              Career Roadmaps
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Path to <span className="text-primary">Tech Success</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Curated step-by-step roadmaps to help you navigate your career journey in tech. 
              From AI to Web Development, find your path.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search roadmaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Level:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmaps Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {filteredRoadmaps?.length || 0} Roadmaps Available
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRoadmaps?.length === 0 ? (
            <div className="text-center py-16">
              <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No roadmaps found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmaps?.map((roadmap) => (
                <Card key={roadmap.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {roadmap.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {roadmap.description || "Comprehensive career roadmap"}
                        </CardDescription>
                      </div>
                      <BookOpen className="h-8 w-8 text-primary/20" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{roadmap.category}</Badge>
                      <Badge className={getLevelColor(roadmap.level)}>{roadmap.level}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{roadmap.view_count} views</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handlePreview(roadmap)}
                        disabled={!roadmap.preview_url}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      {roadmap.download_url && (
                        <Button 
                          variant="outline"
                          onClick={() => window.open(roadmap.download_url!, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Preview Modal */}
      <Dialog open={!!previewRoadmap} onOpenChange={() => setPreviewRoadmap(null)}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewRoadmap?.title}</span>
              {previewRoadmap?.download_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(previewRoadmap.download_url!, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {previewRoadmap?.preview_url && (
              <iframe
                src={previewRoadmap.preview_url}
                className="w-full h-full rounded-lg border"
                title={previewRoadmap.title}
                allow="autoplay"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Roadmaps;

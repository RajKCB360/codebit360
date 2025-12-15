import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Minimize,
  Map,
  BookOpen,
  Eye,
  Share2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

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

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: roadmap, isLoading } = useQuery({
    queryKey: ["roadmap", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as Roadmap;
    },
    enabled: !!id,
  });

  const { data: relatedRoadmaps } = useQuery({
    queryKey: ["related-roadmaps", roadmap?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("is_active", true)
        .eq("category", roadmap?.category || "")
        .neq("id", id)
        .limit(3);
      if (error) throw error;
      return data as Roadmap[];
    },
    enabled: !!roadmap?.category,
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const toggleFullscreen = () => {
    const container = document.getElementById("pdf-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-500/10 text-green-500";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "Advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-primary/10 text-primary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-[70vh] bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <Map className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Roadmap Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The roadmap you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/roadmaps")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roadmaps
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${roadmap.title} | CodeBit360 Roadmaps`}
        description={roadmap.description || `Complete ${roadmap.title} career roadmap for ${roadmap.level} level.`}
        keywords={`${roadmap.category} roadmap, ${roadmap.title}, career path, tech roadmap`}
      />
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/roadmaps")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roadmaps
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold">{roadmap.title}</h1>
              </div>
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {roadmap.description || "Comprehensive career roadmap to help you navigate your learning journey."}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{roadmap.category}</Badge>
                <Badge className={getLevelColor(roadmap.level)}>{roadmap.level}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{roadmap.view_count} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {roadmap.download_url && (
                <Button 
                  size="sm"
                  onClick={() => window.open(roadmap.download_url!, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer Controls */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Zoom:</span>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleResetZoom}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <><Minimize className="h-4 w-4 mr-2" /> Exit Fullscreen</>
                ) : (
                  <><Maximize className="h-4 w-4 mr-2" /> Fullscreen</>
                )}
              </Button>
              {roadmap.preview_url && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(roadmap.preview_url!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Drive
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div 
            id="pdf-container"
            className="relative bg-muted/30 rounded-xl overflow-hidden border"
            style={{ height: "75vh" }}
          >
            {roadmap.preview_url ? (
              <div 
                className="w-full h-full overflow-auto"
                style={{ 
                  display: "flex", 
                  justifyContent: "center",
                  alignItems: "flex-start",
                  padding: zoom > 100 ? "20px" : "0"
                }}
              >
                <iframe
                  src={roadmap.preview_url}
                  className="border-0 transition-transform duration-200"
                  style={{ 
                    width: `${zoom}%`,
                    height: `${zoom}%`,
                    minWidth: "100%",
                    minHeight: "100%",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center"
                  }}
                  title={roadmap.title}
                  allow="autoplay; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Preview not available</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Use the controls above to zoom in/out or enter fullscreen mode. 
            You can also scroll within the viewer to navigate the PDF.
          </p>
        </div>
      </section>

      {/* Related Roadmaps */}
      {relatedRoadmaps && relatedRoadmaps.length > 0 && (
        <section className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Roadmaps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedRoadmaps.map((related) => (
                <Link to={`/roadmaps/${related.id}`} key={related.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{related.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {related.description || "Comprehensive career roadmap"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{related.category}</Badge>
                        <Badge className={getLevelColor(related.level)}>{related.level}</Badge>
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
  );
};

export default RoadmapDetail;

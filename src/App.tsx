import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobsBySkill from "./pages/JobsBySkill";
import JobsByCategory from "./pages/JobsByCategory";
import JobsByCompany from "./pages/JobsByCompany";
import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import InternshipsBySkill from "./pages/InternshipsBySkill";
import InternshipsByDomain from "./pages/InternshipsByDomain";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import ChapterDetail from "./pages/ChapterDetail";
import CourseManage from "./pages/CourseManage";
import Roadmaps from "./pages/Roadmaps";
import RoadmapDetail from "./pages/RoadmapDetail";
import ResumeBuilder from "./pages/ResumeBuilder";
import CareerAssistant from "./pages/CareerAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/courses/:id" element={<CourseManage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/skills" element={<JobsBySkill />} />
              <Route path="/jobs/skill/:skill" element={<JobsBySkill />} />
              <Route path="/jobs/categories" element={<JobsByCategory />} />
              <Route path="/jobs/category/:category" element={<JobsByCategory />} />
              <Route path="/jobs/companies" element={<JobsByCompany />} />
              <Route path="/jobs/company/:company" element={<JobsByCompany />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/internships/skills" element={<InternshipsBySkill />} />
              <Route path="/internships/skill/:skill" element={<InternshipsBySkill />} />
              <Route path="/internships/domains" element={<InternshipsByDomain />} />
              <Route path="/internships/domain/:domain" element={<InternshipsByDomain />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:id/chapter/:chapterId" element={<ChapterDetail />} />
              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/career-assistant" element={<CareerAssistant />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Eye, Palette, Code, Briefcase, GraduationCap, 
  Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink,
  Sparkles, Copy, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SEO from "@/components/SEO";

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    summary: string;
  };
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }>;
  certifications: string[];
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "Your Name",
    email: "email@example.com",
    phone: "+91 9876543210",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/yourname",
    github: "github.com/yourname",
    portfolio: "",
    summary: "A passionate software developer with experience in building web applications.",
  },
  skills: ["React", "JavaScript", "TypeScript", "Node.js", "Python", "SQL"],
  experience: [
    {
      title: "Software Developer",
      company: "Tech Company",
      duration: "2023 - Present",
      description: "Developed and maintained web applications using React and Node.js.",
    },
  ],
  projects: [
    {
      name: "Portfolio Website",
      description: "Personal portfolio showcasing projects and skills.",
      technologies: "React, Tailwind CSS",
      link: "",
    },
  ],
  education: [
    {
      degree: "B.Tech in Computer Science",
      institution: "ABC University",
      year: "2023",
      grade: "8.5 CGPA",
    },
  ],
  certifications: ["AWS Cloud Practitioner", "Google Analytics"],
};

type ThemeType = "developer" | "creative" | "minimal" | "bold";

const themes: Record<ThemeType, { name: string; bg: string; accent: string; text: string }> = {
  developer: { name: "Developer Dark", bg: "bg-slate-900", accent: "text-emerald-400", text: "text-slate-100" },
  creative: { name: "Creative Gradient", bg: "bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900", accent: "text-pink-400", text: "text-white" },
  minimal: { name: "Minimal Light", bg: "bg-white", accent: "text-blue-600", text: "text-gray-900" },
  bold: { name: "Bold & Modern", bg: "bg-zinc-950", accent: "text-orange-500", text: "text-zinc-100" },
};

const PortfolioGenerator = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("developer");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load resume data from localStorage (from Resume Builder)
    const savedResume = localStorage.getItem("resumeData");
    if (savedResume) {
      try {
        const parsed = JSON.parse(savedResume);
        setResumeData({
          personalInfo: {
            fullName: parsed.personalInfo?.fullName || defaultResumeData.personalInfo.fullName,
            email: parsed.personalInfo?.email || defaultResumeData.personalInfo.email,
            phone: parsed.personalInfo?.phone || defaultResumeData.personalInfo.phone,
            location: parsed.personalInfo?.location || defaultResumeData.personalInfo.location,
            linkedin: parsed.personalInfo?.linkedin || "",
            github: parsed.personalInfo?.github || "",
            portfolio: parsed.personalInfo?.portfolio || "",
            summary: parsed.personalInfo?.summary || defaultResumeData.personalInfo.summary,
          },
          skills: parsed.skills?.length > 0 ? parsed.skills : defaultResumeData.skills,
          experience: parsed.experience?.length > 0 ? parsed.experience : defaultResumeData.experience,
          projects: parsed.projects?.length > 0 ? parsed.projects : defaultResumeData.projects,
          education: parsed.education?.length > 0 ? parsed.education : defaultResumeData.education,
          certifications: parsed.certifications?.length > 0 ? parsed.certifications : defaultResumeData.certifications,
        });
        toast({
          title: "Resume Data Loaded",
          description: "Your resume data from Resume Builder has been imported.",
        });
      } catch {
        console.log("No valid resume data found");
      }
    }
  }, []);

  const theme = themes[selectedTheme];

  const generateHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personalInfo.fullName} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="${theme.bg} ${theme.text} min-h-screen">
  <div class="max-w-4xl mx-auto px-6 py-12">
    <!-- Header -->
    <header class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">${resumeData.personalInfo.fullName}</h1>
      <p class="text-lg opacity-80 mb-6 max-w-2xl mx-auto">${resumeData.personalInfo.summary}</p>
      <div class="flex flex-wrap justify-center gap-4 text-sm">
        ${resumeData.personalInfo.email ? `<a href="mailto:${resumeData.personalInfo.email}" class="${theme.accent} hover:underline">${resumeData.personalInfo.email}</a>` : ''}
        ${resumeData.personalInfo.github ? `<a href="https://${resumeData.personalInfo.github}" target="_blank" class="${theme.accent} hover:underline">GitHub</a>` : ''}
        ${resumeData.personalInfo.linkedin ? `<a href="https://${resumeData.personalInfo.linkedin}" target="_blank" class="${theme.accent} hover:underline">LinkedIn</a>` : ''}
      </div>
    </header>

    <!-- Skills -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4 ${theme.accent}">Skills</h2>
      <div class="flex flex-wrap gap-2">
        ${resumeData.skills.map(skill => `<span class="px-3 py-1 rounded-full text-sm ${selectedTheme === 'minimal' ? 'bg-gray-100 text-gray-800' : 'bg-white/10'}">${skill}</span>`).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 ${theme.accent}">Projects</h2>
      <div class="grid gap-6">
        ${resumeData.projects.map(project => `
        <div class="${selectedTheme === 'minimal' ? 'border border-gray-200 rounded-lg p-6' : 'bg-white/5 rounded-lg p-6'}">
          <h3 class="text-xl font-semibold mb-2">${project.name}</h3>
          <p class="opacity-80 mb-3">${project.description}</p>
          <p class="text-sm ${theme.accent}">${project.technologies}</p>
          ${project.link ? `<a href="${project.link}" target="_blank" class="text-sm ${theme.accent} hover:underline mt-2 inline-block">View Project →</a>` : ''}
        </div>`).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 ${theme.accent}">Experience</h2>
      <div class="space-y-6">
        ${resumeData.experience.map(exp => `
        <div class="border-l-2 ${selectedTheme === 'minimal' ? 'border-blue-600' : 'border-current'} pl-4">
          <h3 class="text-lg font-semibold">${exp.title}</h3>
          <p class="${theme.accent} text-sm">${exp.company} • ${exp.duration}</p>
          <p class="opacity-80 mt-2">${exp.description}</p>
        </div>`).join('')}
      </div>
    </section>

    <!-- Education -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 ${theme.accent}">Education</h2>
      <div class="space-y-4">
        ${resumeData.education.map(edu => `
        <div>
          <h3 class="text-lg font-semibold">${edu.degree}</h3>
          <p class="opacity-80">${edu.institution} • ${edu.year}</p>
          ${edu.grade ? `<p class="text-sm ${theme.accent}">${edu.grade}</p>` : ''}
        </div>`).join('')}
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center pt-8 border-t ${selectedTheme === 'minimal' ? 'border-gray-200' : 'border-white/10'}">
      <p class="text-sm opacity-60">Built with CodeBit360 Portfolio Generator</p>
    </footer>
  </div>
</body>
</html>`;
    return html;
  };

  const handleDownload = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, "-").toLowerCase()}-portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Portfolio Downloaded!",
      description: "Open the HTML file in any browser to view your portfolio.",
    });
  };

  const handleCopyHTML = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "HTML Copied!",
      description: "Paste it into any HTML file or hosting service.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Portfolio Generator - Create Your Developer Portfolio | CodeBit360"
        description="Generate a professional portfolio website from your resume data in one click. Choose from multiple themes and download as HTML."
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Portfolio Generator</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Generate a stunning portfolio website from your resume data. Choose a theme and download as a single HTML file.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-3">Select Theme</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(themes) as ThemeType[]).map((key) => (
                      <Button
                        key={key}
                        variant={selectedTheme === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTheme(key)}
                        className="text-xs"
                      >
                        {themes[key].name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download HTML
                  </Button>
                  <Button variant="outline" onClick={handleCopyHTML} className="w-full">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy HTML Code"}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Your resume data is automatically loaded from the Resume Builder. Go to Resume Builder to update your details.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg overflow-hidden ${theme.bg} ${theme.text} p-6 min-h-[500px]`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{resumeData.personalInfo.fullName}</h2>
                    <p className="text-sm opacity-80 mb-4 max-w-lg mx-auto">{resumeData.personalInfo.summary}</p>
                    <div className="flex flex-wrap justify-center gap-3 text-xs">
                      {resumeData.personalInfo.email && (
                        <span className={`flex items-center gap-1 ${theme.accent}`}>
                          <Mail className="h-3 w-3" /> {resumeData.personalInfo.email}
                        </span>
                      )}
                      {resumeData.personalInfo.github && (
                        <span className={`flex items-center gap-1 ${theme.accent}`}>
                          <Github className="h-3 w-3" /> GitHub
                        </span>
                      )}
                      {resumeData.personalInfo.linkedin && (
                        <span className={`flex items-center gap-1 ${theme.accent}`}>
                          <Linkedin className="h-3 w-3" /> LinkedIn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-bold mb-3 ${theme.accent}`}>Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.slice(0, 8).map((skill, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className={`text-xs ${selectedTheme === 'minimal' ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-inherit border-0'}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                      {resumeData.skills.length > 8 && (
                        <Badge variant="outline" className="text-xs">+{resumeData.skills.length - 8} more</Badge>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-bold mb-3 ${theme.accent}`}>Projects</h3>
                    <div className="grid gap-3">
                      {resumeData.projects.slice(0, 2).map((project, i) => (
                        <div key={i} className={`rounded p-3 ${selectedTheme === 'minimal' ? 'border' : 'bg-white/5'}`}>
                          <h4 className="font-semibold text-sm">{project.name}</h4>
                          <p className="text-xs opacity-70 mt-1">{project.description}</p>
                          <p className={`text-xs ${theme.accent} mt-1`}>{project.technologies}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Preview */}
                  <div>
                    <h3 className={`text-lg font-bold mb-3 ${theme.accent}`}>Experience</h3>
                    {resumeData.experience.slice(0, 1).map((exp, i) => (
                      <div key={i} className={`border-l-2 pl-3 ${selectedTheme === 'minimal' ? 'border-blue-600' : ''}`}>
                        <h4 className="font-semibold text-sm">{exp.title}</h4>
                        <p className={`text-xs ${theme.accent}`}>{exp.company} • {exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PortfolioGenerator;

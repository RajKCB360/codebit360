import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Download,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Eye,
  Wand2,
  Loader2,
} from "lucide-react";

// Resume templates
const templates = [
  { id: "fresher", name: "Fresher / Student", description: "Perfect for college students and fresh graduates", color: "brand-indigo" },
  { id: "developer", name: "Software Developer", description: "Technical resume for developers", color: "brand-cyan" },
  { id: "devops", name: "DevOps / Cloud", description: "For cloud and infrastructure roles", color: "brand-purple" },
  { id: "data", name: "Data / AI Roles", description: "Data science and ML positions", color: "brand-orange" },
  { id: "experienced", name: "Experienced Pro", description: "For professionals with 3+ years", color: "brand-green" },
];

const steps = [
  { id: "template", title: "Template", icon: FileText },
  { id: "personal", title: "Personal Info", icon: User },
  { id: "skills", title: "Skills", icon: Code },
  { id: "experience", title: "Experience", icon: Briefcase },
  { id: "projects", title: "Projects", icon: Award },
  { id: "education", title: "Education", icon: GraduationCap },
];

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
  score?: string;
}

interface ResumeData {
  template: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary: string;
  };
  skills: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
}

const defaultResumeData: ResumeData = {
  template: "fresher",
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
  },
  skills: [],
  experience: [],
  projects: [],
  education: [],
};

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [newSkill, setNewSkill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsIssues, setAtsIssues] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Load from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem("resume-draft");
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved resume");
      }
    }
  });

  // Save to localStorage
  const saveDraft = () => {
    localStorage.setItem("resume-draft", JSON.stringify(resumeData));
    toast({ title: "Draft saved", description: "Your resume has been saved locally" });
  };

  // ATS Check
  const checkATS = () => {
    const issues: string[] = [];
    let score = 100;

    if (!resumeData.personal.fullName) { issues.push("Missing full name"); score -= 15; }
    if (!resumeData.personal.email) { issues.push("Missing email"); score -= 10; }
    if (!resumeData.personal.phone) { issues.push("Missing phone number"); score -= 10; }
    if (!resumeData.personal.summary || resumeData.personal.summary.length < 50) { 
      issues.push("Professional summary too short (min 50 chars)"); score -= 15; 
    }
    if (resumeData.skills.length < 5) { issues.push("Add at least 5 skills"); score -= 10; }
    if (resumeData.experience.length === 0 && resumeData.projects.length === 0) { 
      issues.push("Add experience or projects"); score -= 20; 
    }
    if (resumeData.education.length === 0) { issues.push("Add education details"); score -= 10; }

    // Check for action verbs in descriptions
    const actionVerbs = ["developed", "built", "created", "implemented", "designed", "managed", "led", "improved", "achieved", "reduced"];
    const allText = resumeData.experience.map(e => e.description).join(" ").toLowerCase() + 
                   resumeData.projects.map(p => p.description).join(" ").toLowerCase();
    const hasActionVerbs = actionVerbs.some(verb => allText.includes(verb));
    if (!hasActionVerbs && allText.length > 0) {
      issues.push("Use action verbs (developed, built, implemented...)"); 
      score -= 10;
    }

    setAtsScore(Math.max(0, score));
    setAtsIssues(issues);
  };

  // AI Improve bullet point
  const improveBulletPoint = async (text: string, type: "experience" | "project") => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-resume-helper", {
        body: { action: "improve", text, type },
      });
      
      if (error) throw error;
      return data.improved;
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate improvement", variant: "destructive" });
      return text;
    } finally {
      setIsGenerating(false);
    }
  };

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Add experience
  const addExperience = () => {
    const newExp: Experience = { id: Date.now().toString(), company: "", role: "", duration: "", description: "" };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  // Update experience
  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp),
    }));
  };

  // Remove experience
  const removeExperience = (id: string) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  // Add project
  const addProject = () => {
    const newProj: Project = { id: Date.now().toString(), name: "", description: "", technologies: "" };
    setResumeData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  // Update project
  const updateProject = (id: string, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj),
    }));
  };

  // Remove project
  const removeProject = (id: string) => {
    setResumeData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
  };

  // Add education
  const addEducation = () => {
    const newEdu: Education = { id: Date.now().toString(), institution: "", degree: "", year: "" };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  // Update education
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu),
    }));
  };

  // Remove education
  const removeEducation = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  // Download PDF
  const downloadPDF = () => {
    if (previewRef.current) {
      window.print();
    }
  };

  // Navigate steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Smart <span className="gradient-text">Resume Builder</span>
            </motion.h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create an ATS-friendly resume in minutes with AI-powered suggestions
            </p>
          </div>

          {/* Progress */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <AnimatePresence mode="wait">
                  {/* Template Selection */}
                  {currentStep === 0 && (
                    <motion.div
                      key="template"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
                      <div className="grid gap-4">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setResumeData(prev => ({ ...prev, template: template.id }))}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              resumeData.template === template.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-${template.color}/10 flex items-center justify-center`}>
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{template.name}</h3>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Personal Info */}
                  {currentStep === 1 && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={resumeData.personal.fullName}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, fullName: e.target.value }
                            }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={resumeData.personal.email}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, email: e.target.value }
                            }))}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={resumeData.personal.phone}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, phone: e.target.value }
                            }))}
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={resumeData.personal.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, location: e.target.value }
                            }))}
                            placeholder="Mumbai, India"
                          />
                        </div>
                        <div>
                          <Label>LinkedIn</Label>
                          <Input
                            value={resumeData.personal.linkedin}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, linkedin: e.target.value }
                            }))}
                            placeholder="linkedin.com/in/johndoe"
                          />
                        </div>
                        <div>
                          <Label>GitHub</Label>
                          <Input
                            value={resumeData.personal.github}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal: { ...prev.personal, github: e.target.value }
                            }))}
                            placeholder="github.com/johndoe"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Professional Summary *</Label>
                        <Textarea
                          value={resumeData.personal.summary}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, summary: e.target.value }
                          }))}
                          placeholder="A brief summary of your professional background and career goals..."
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {resumeData.personal.summary.length}/200 characters
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Skills */}
                  {currentStep === 2 && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-semibold mb-4">Skills</h2>
                      <div className="flex gap-2 mb-4">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill (e.g., Python, React, AWS)"
                          onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        />
                        <Button onClick={addSkill} size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1 cursor-pointer group"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <Trash2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        ))}
                      </div>
                      {resumeData.skills.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-4">
                          Add your technical and soft skills. Click on a skill to remove it.
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Experience */}
                  {currentStep === 3 && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Work Experience</h2>
                        <Button onClick={addExperience} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                      <div className="space-y-6">
                        {resumeData.experience.map((exp, index) => (
                          <div key={exp.id} className="p-4 border rounded-lg relative">
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label>Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                  placeholder="Company Name"
                                />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Input
                                  value={exp.role}
                                  onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                                  placeholder="Job Title"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <Label>Duration</Label>
                                <Input
                                  value={exp.duration}
                                  onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                                  placeholder="Jan 2023 - Present"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Label>Description</Label>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isGenerating || !exp.description}
                                  onClick={async () => {
                                    const improved = await improveBulletPoint(exp.description, "experience");
                                    updateExperience(exp.id, "description", improved);
                                  }}
                                >
                                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                  <span className="ml-1">AI Improve</span>
                                </Button>
                              </div>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                placeholder="Describe your responsibilities and achievements..."
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                        {resumeData.experience.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No experience added yet. Click "Add" to add your work experience.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Projects */}
                  {currentStep === 4 && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Projects</h2>
                        <Button onClick={addProject} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                      <div className="space-y-6">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="p-4 border rounded-lg relative">
                            <button
                              onClick={() => removeProject(proj.id)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label>Project Name</Label>
                                <Input
                                  value={proj.name}
                                  onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                  placeholder="Project Name"
                                />
                              </div>
                              <div>
                                <Label>Technologies</Label>
                                <Input
                                  value={proj.technologies}
                                  onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                                  placeholder="React, Node.js, MongoDB"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Label>Description</Label>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isGenerating || !proj.description}
                                  onClick={async () => {
                                    const improved = await improveBulletPoint(proj.description, "project");
                                    updateProject(proj.id, "description", improved);
                                  }}
                                >
                                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                  <span className="ml-1">AI Improve</span>
                                </Button>
                              </div>
                              <Textarea
                                value={proj.description}
                                onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                placeholder="Describe what you built and its impact..."
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                        {resumeData.projects.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No projects added yet. Click "Add" to showcase your work.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Education */}
                  {currentStep === 5 && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Education</h2>
                        <Button onClick={addEducation} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                      <div className="space-y-6">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="p-4 border rounded-lg relative">
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Institution</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                  placeholder="University/College Name"
                                />
                              </div>
                              <div>
                                <Label>Degree</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                  placeholder="B.Tech in Computer Science"
                                />
                              </div>
                              <div>
                                <Label>Year</Label>
                                <Input
                                  value={edu.year}
                                  onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                                  placeholder="2020 - 2024"
                                />
                              </div>
                              <div>
                                <Label>Score (Optional)</Label>
                                <Input
                                  value={edu.score}
                                  onChange={(e) => updateEducation(edu.id, "score", e.target.value)}
                                  placeholder="8.5 CGPA"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {resumeData.education.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No education added yet. Click "Add" to add your education details.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={saveDraft}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    {currentStep < steps.length - 1 ? (
                      <Button onClick={nextStep}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={downloadPDF}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* ATS Score Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    ATS Optimization Score
                  </h3>
                  <Button size="sm" variant="outline" onClick={checkATS}>
                    Check Score
                  </Button>
                </div>
                {atsScore !== null && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${
                        atsScore >= 80 ? "text-brand-green" : atsScore >= 60 ? "text-brand-orange" : "text-destructive"
                      }`}>
                        {atsScore}%
                      </div>
                      <Progress value={atsScore} className="flex-1" />
                    </div>
                    {atsIssues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Improvements needed:</p>
                        {atsIssues.map((issue, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                    {atsIssues.length === 0 && (
                      <div className="flex items-center gap-2 text-brand-green">
                        <CheckCircle className="w-5 h-5" />
                        <span>Your resume is ATS-optimized!</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </h3>
                  <Button size="sm" variant="outline" onClick={downloadPDF}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
                
                {/* Resume Preview */}
                <div 
                  ref={previewRef}
                  className="bg-white text-black p-6 rounded-lg shadow-inner min-h-[600px] text-sm print:shadow-none print:p-0"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {/* Header */}
                  <div className="text-center mb-4 border-b pb-4">
                    <h1 className="text-xl font-bold text-gray-900">
                      {resumeData.personal.fullName || "Your Name"}
                    </h1>
                    <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-2">
                      {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                      {resumeData.personal.phone && <span>• {resumeData.personal.phone}</span>}
                      {resumeData.personal.location && <span>• {resumeData.personal.location}</span>}
                    </div>
                    <div className="text-xs text-blue-600 mt-1 flex flex-wrap justify-center gap-2">
                      {resumeData.personal.linkedin && <span>{resumeData.personal.linkedin}</span>}
                      {resumeData.personal.github && <span>• {resumeData.personal.github}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personal.summary && (
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-gray-900 border-b mb-2">PROFESSIONAL SUMMARY</h2>
                      <p className="text-xs text-gray-700">{resumeData.personal.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-gray-900 border-b mb-2">SKILLS</h2>
                      <p className="text-xs text-gray-700">{resumeData.skills.join(" • ")}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-gray-900 border-b mb-2">EXPERIENCE</h2>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="mb-3">
                          <div className="flex justify-between">
                            <span className="font-semibold text-xs">{exp.role || "Role"}</span>
                            <span className="text-xs text-gray-500">{exp.duration}</span>
                          </div>
                          <div className="text-xs text-gray-600">{exp.company || "Company"}</div>
                          <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-gray-900 border-b mb-2">PROJECTS</h2>
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="mb-3">
                          <div className="font-semibold text-xs">{proj.name || "Project Name"}</div>
                          <div className="text-xs text-gray-500">{proj.technologies}</div>
                          <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-gray-900 border-b mb-2">EDUCATION</h2>
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="mb-2">
                          <div className="flex justify-between">
                            <span className="font-semibold text-xs">{edu.degree || "Degree"}</span>
                            <span className="text-xs text-gray-500">{edu.year}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {edu.institution} {edu.score && `• ${edu.score}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
  TrendingUp,
  FileText,
  MessageSquare,
  Loader2,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  ThumbsUp,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Target, text: "Which career is best for me?", category: "guidance" },
  { icon: TrendingUp, text: "How to become a DevOps engineer?", category: "roadmap" },
  { icon: Briefcase, text: "How to switch from support to developer?", category: "switch" },
  { icon: GraduationCap, text: "Best skills for freshers in 2024", category: "skills" },
  { icon: FileText, text: "Review my resume for Data Analyst role", category: "resume" },
  { icon: MessageSquare, text: "Prepare me for React interview", category: "interview" },
];

const CareerAssistant = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Skill Gap Analysis state
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skillGapResult, setSkillGapResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Resume Match state
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Interview Prep state
  const [interviewRole, setInterviewRole] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm your AI Career Assistant. I can help you with:\n\n• **Career guidance** - Finding the right path for you\n• **Skill analysis** - Understanding what you need to learn\n• **Resume optimization** - Making your resume job-ready\n• **Interview preparation** - Practice and improve\n\nHow can I help you today?",
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Chat with AI
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "chat",
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to get response. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Skill Gap Analysis
  const analyzeSkillGap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      toast({ title: "Missing input", description: "Please enter both current skills and target role", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "skill-gap",
          currentSkills,
          targetRole,
        },
      });

      if (error) throw error;
      setSkillGapResult(data.result);
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze skills. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resume Match Analysis
  const analyzeResumeMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ title: "Missing input", description: "Please enter both resume and job description", variant: "destructive" });
      return;
    }

    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "resume-match",
          resumeText,
          jobDescription,
        },
      });

      if (error) throw error;
      setMatchResult(data.result);
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze match. Please try again.", variant: "destructive" });
    } finally {
      setIsMatching(false);
    }
  };

  // Generate Interview Questions
  const generateInterviewQuestions = async () => {
    if (!interviewRole.trim()) {
      toast({ title: "Missing input", description: "Please enter a role for interview prep", variant: "destructive" });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "interview-prep",
          role: interviewRole,
        },
      });

      if (error) throw error;
      setInterviewQuestions(data.questions || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate questions. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              AI <span className="gradient-text">Career Assistant</span>
            </motion.h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your personal AI mentor for career guidance, skill analysis, and interview preparation
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Skill Gap</span>
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume Match</span>
                </TabsTrigger>
                <TabsTrigger value="interview" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Interview</span>
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="space-y-4">
                <Card className="p-0 overflow-hidden">
                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                        >
                          {message.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}>
                            <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                              __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                            }} />
                          </div>
                          {message.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="border-t p-4 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-3">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => sendMessage(prompt.text)}
                          disabled={isLoading}
                        >
                          <prompt.icon className="w-3 h-3 mr-1" />
                          {prompt.text}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about careers, skills, resumes, interviews..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        disabled={isLoading}
                      />
                      <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Skill Gap Analysis Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Analyze Your Skill Gap
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Current Skills</label>
                        <Textarea
                          value={currentSkills}
                          onChange={(e) => setCurrentSkills(e.target.value)}
                          placeholder="e.g., Python, SQL, Excel, Data Visualization, Basic ML"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Target Role</label>
                        <Input
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g., Data Scientist, DevOps Engineer, Full Stack Developer"
                        />
                      </div>
                      <Button onClick={analyzeSkillGap} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Skill Gap
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>

                  {skillGapResult && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Analysis Result</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Readiness Score</span>
                            <span className="text-2xl font-bold text-primary">{skillGapResult.readinessScore}%</span>
                          </div>
                          <Progress value={skillGapResult.readinessScore} />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-brand-green" />
                            Skills You Have
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {skillGapResult.existingSkills?.map((skill: string, i: number) => (
                              <Badge key={i} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-brand-orange" />
                            Skills to Learn
                          </h4>
                          <div className="space-y-2">
                            {skillGapResult.missingSkills?.map((skill: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                <span className="text-sm">{skill.name}</span>
                                <Badge variant={skill.priority === "high" ? "destructive" : "outline"}>
                                  {skill.priority}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {skillGapResult.timeEstimate && (
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <p className="text-sm">
                              <strong>Estimated Time:</strong> {skillGapResult.timeEstimate}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Resume Match Tab */}
              <TabsContent value="resume" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Resume-Job Match Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Resume (paste text)</label>
                        <Textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste your resume content here..."
                          rows={6}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Job Description</label>
                        <Textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          rows={6}
                        />
                      </div>
                      <Button onClick={analyzeResumeMatch} disabled={isMatching} className="w-full">
                        {isMatching ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Match
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>

                  {matchResult && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Match Analysis</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Match Score</span>
                            <span className={`text-2xl font-bold ${
                              matchResult.matchScore >= 70 ? "text-brand-green" : 
                              matchResult.matchScore >= 50 ? "text-brand-orange" : "text-destructive"
                            }`}>
                              {matchResult.matchScore}%
                            </span>
                          </div>
                          <Progress value={matchResult.matchScore} />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Matching Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.matchingKeywords?.map((kw: string, i: number) => (
                              <Badge key={i} className="bg-brand-green/10 text-brand-green">{kw}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Missing Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.missingKeywords?.map((kw: string, i: number) => (
                              <Badge key={i} variant="destructive">{kw}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                          <ul className="space-y-2">
                            {matchResult.suggestions?.map((suggestion: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Interview Prep Tab */}
              <TabsContent value="interview" className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Interview Preparation
                  </h3>
                  <div className="flex gap-4 mb-6">
                    <Input
                      value={interviewRole}
                      onChange={(e) => setInterviewRole(e.target.value)}
                      placeholder="Enter role (e.g., React Developer, Data Analyst)"
                      className="flex-1"
                    />
                    <Button onClick={generateInterviewQuestions} disabled={isGeneratingQuestions}>
                      {isGeneratingQuestions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </div>

                  {interviewQuestions.length > 0 && (
                    <div className="space-y-4">
                      {interviewQuestions.map((q, i) => (
                        <Card key={i} className="p-4 bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{q.type}</Badge>
                                <Badge variant={q.difficulty === "easy" ? "secondary" : q.difficulty === "medium" ? "default" : "destructive"}>
                                  {q.difficulty}
                                </Badge>
                              </div>
                              <p className="font-medium mb-2">{q.question}</p>
                              <details className="group">
                                <summary className="text-sm text-primary cursor-pointer hover:underline">
                                  Show suggested answer
                                </summary>
                                <p className="text-sm text-muted-foreground mt-2 p-3 bg-background rounded-lg">
                                  {q.suggestedAnswer}
                                </p>
                              </details>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${q.question}\n\nSuggested Answer:\n${q.suggestedAnswer}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {interviewQuestions.length === 0 && !isGeneratingQuestions && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a role and click "Generate Questions" to get started</p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareerAssistant;

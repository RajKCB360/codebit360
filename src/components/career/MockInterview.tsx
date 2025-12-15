import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Send,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Timer,
  Target,
  Award,
  Loader2,
  Volume2,
  ChevronRight,
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: string;
  difficulty: string;
  suggestedAnswer: string;
  keyPoints: string[];
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
  tips: string[];
}

interface MockInterviewProps {
  role: string;
  onClose?: () => void;
}

const MockInterview = ({ role, onClose }: MockInterviewProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate questions on mount
  useEffect(() => {
    generateQuestions();
  }, [role]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "mock-interview-questions",
          role,
          count: 5,
        },
      });

      if (error) throw error;
      
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setSessionScores([]);
      setShowFeedback(false);
      setFeedback(null);
      setUserAnswer("");
      setTimer(0);
      setIsTimerRunning(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate questions. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({ title: "Empty answer", description: "Please provide an answer before submitting", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-career-assistant", {
        body: { 
          action: "evaluate-answer",
          question: questions[currentIndex].question,
          answer: userAnswer,
          role,
          questionType: questions[currentIndex].type,
        },
      });

      if (error) throw error;
      
      setFeedback(data.feedback);
      setSessionScores(prev => [...prev, data.feedback.score]);
      setShowFeedback(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to evaluate answer. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setFeedback(null);
      setShowFeedback(false);
      setTimer(0);
      setIsTimerRunning(true);
    }
  };

  const restartInterview = () => {
    generateQuestions();
  };

  const averageScore = sessionScores.length > 0 
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) 
    : 0;

  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex === questions.length - 1 && showFeedback;

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Preparing Your Interview</h3>
        <p className="text-muted-foreground">Generating questions for {role}...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Mock Interview: {role}
          </h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className={`font-mono ${timer > 120 ? "text-destructive" : ""}`}>
              {formatTime(timer)}
            </span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            Avg: {averageScore}%
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100} className="h-2" />
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i < currentIndex ? "bg-primary" : 
                i === currentIndex ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{currentQuestion?.type}</Badge>
                    <Badge variant={
                      currentQuestion?.difficulty === "easy" ? "secondary" : 
                      currentQuestion?.difficulty === "medium" ? "default" : "destructive"
                    }>
                      {currentQuestion?.difficulty}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium">{currentQuestion?.question}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Answer
                  </label>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here... Take your time and structure your response clearly."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userAnswer.length} characters • Aim for 100-300 words
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4" />
                    <span>Tip: Use STAR method for behavioral questions</span>
                  </div>
                  <Button onClick={submitAnswer} disabled={isSubmitting || !userAnswer.trim()}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={`feedback-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              {/* Score */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                  feedback?.score && feedback.score >= 80 ? "bg-brand-green/10 text-brand-green" :
                  feedback?.score && feedback.score >= 60 ? "bg-brand-orange/10 text-brand-orange" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  <span className="text-3xl font-bold">{feedback?.score}%</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {feedback?.score && feedback.score >= 80 ? "Excellent Answer!" :
                   feedback?.score && feedback.score >= 60 ? "Good Effort!" :
                   "Room for Improvement"}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-brand-green">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {feedback?.strengths?.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-brand-orange">
                    <AlertCircle className="w-4 h-4" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {feedback?.improvements?.map((imp, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-brand-orange mt-1">→</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Answer */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  Model Answer
                </h4>
                <p className="text-sm text-muted-foreground">{feedback?.sampleAnswer}</p>
              </div>

              {/* Tips */}
              {feedback?.tips && feedback.tips.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1">
                    {feedback.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button variant="outline" onClick={restartInterview}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
                {!isComplete ? (
                  <Button onClick={nextQuestion}>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Final Score</p>
                      <p className="text-2xl font-bold text-primary">{averageScore}%</p>
                    </div>
                    <Button onClick={restartInterview}>
                      <Award className="w-4 h-4 mr-2" />
                      Practice Again
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Your Answer Display (when showing feedback) */}
      {showFeedback && (
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-2 text-sm">Your Answer:</h4>
          <p className="text-sm text-muted-foreground">{userAnswer}</p>
        </Card>
      )}
    </div>
  );
};

export default MockInterview;

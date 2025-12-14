import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Briefcase, 
  FileText, 
  Bookmark,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Enrollment {
  id: string;
  status: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    level: string;
    duration: string;
  };
}

interface InternshipApplication {
  id: string;
  status: string;
  applied_at: string;
  admin_notes: string | null;
  internships: {
    id: string;
    title: string;
    duration: string;
  };
}

interface SavedJob {
  id: string;
  saved_at: string;
  jobs: {
    id: string;
    job_title: string;
    company_name: string;
    location: string;
    job_type: string;
  };
}

interface ResumeRequest {
  id: string;
  service_type: string;
  status: string;
  payment_status: string;
  admin_feedback: string | null;
  requested_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [resumeRequests, setResumeRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchAllData();
    }
  }, [user, authLoading, navigate]);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      const [enrollmentsRes, applicationsRes, savedJobsRes, resumeRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select('id, status, enrolled_at, courses(id, title, level, duration)')
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('internship_applications')
          .select('id, status, applied_at, admin_notes, internships(id, title, duration)')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false }),
        supabase
          .from('saved_jobs')
          .select('id, saved_at, jobs(id, job_title, company_name, location, job_type)')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false }),
        supabase
          .from('resume_services')
          .select('id, service_type, status, payment_status, admin_feedback, requested_at')
          .eq('user_id', user.id)
          .order('requested_at', { ascending: false }),
      ]);

      if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data as unknown as Enrollment[]);
      if (applicationsRes.data) setApplications(applicationsRes.data as unknown as InternshipApplication[]);
      if (savedJobsRes.data) setSavedJobs(savedJobsRes.data as unknown as SavedJob[]);
      if (resumeRes.data) setResumeRequests(resumeRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (savedJobId: string) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', savedJobId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove job', variant: 'destructive' });
    } else {
      setSavedJobs(savedJobs.filter(j => j.id !== savedJobId));
      toast({ title: 'Removed', description: 'Job removed from saved list' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getServiceLabel = (type: string) => {
    const labels: Record<string, string> = {
      'resume_review': 'Resume Review',
      'resume_rewrite': 'Resume Rewrite',
      'linkedin_optimization': 'LinkedIn Optimization',
      'mock_interview': 'Mock Interview',
    };
    return labels[type] || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Student Dashboard | CodeBit360"
        description="Track your enrolled courses, internship applications, saved jobs, and resume service requests."
        canonicalUrl="/dashboard"
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold gradient-text">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your learning journey and applications</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{enrollments.length}</p>
                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Briefcase className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Bookmark className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{savedJobs.length}</p>
                    <p className="text-sm text-muted-foreground">Saved Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/10">
                    <FileText className="w-5 h-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resumeRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Resume Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full max-w-lg bg-muted/50">
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Courses</span>
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Applications</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume</span>
                </TabsTrigger>
              </TabsList>

              {/* Enrolled Courses */}
              <TabsContent value="courses" className="mt-6">
                <div className="space-y-4">
                  {enrollments.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="py-12 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
                        <p className="text-muted-foreground mb-4">Start learning today!</p>
                        <Link to="/#courses">
                          <Button variant="gradient">Browse Courses</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    enrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="glass-card">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{enrollment.courses?.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{enrollment.courses?.level}</span>
                                <span>•</span>
                                <span>{enrollment.courses?.duration}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(enrollment.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Internship Applications */}
              <TabsContent value="applications" className="mt-6">
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="py-12 text-center">
                        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                        <p className="text-muted-foreground mb-4">Apply for internships to kickstart your career!</p>
                        <Link to="/#internships">
                          <Button variant="gradient">View Internships</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    applications.map((app) => (
                      <Card key={app.id} className="glass-card">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{app.internships?.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{app.internships?.duration}</span>
                                <span>•</span>
                                <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                              </div>
                              {app.admin_notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  Note: {app.admin_notes}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(app.status || 'pending')}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Saved Jobs */}
              <TabsContent value="saved" className="mt-6">
                <div className="space-y-4">
                  {savedJobs.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="py-12 text-center">
                        <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
                        <p className="text-muted-foreground mb-4">Save jobs to apply later!</p>
                        <Link to="/jobs">
                          <Button variant="gradient">Browse Jobs</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    savedJobs.map((saved) => (
                      <Card key={saved.id} className="glass-card">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Link to={`/jobs/${saved.jobs?.id}`} className="hover:text-primary transition-colors">
                                <h3 className="font-semibold">{saved.jobs?.job_title}</h3>
                              </Link>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {saved.jobs?.company_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {saved.jobs?.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{saved.jobs?.job_type}</Badge>
                              <Link to={`/jobs/${saved.jobs?.id}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeSavedJob(saved.id)}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Resume Requests */}
              <TabsContent value="resume" className="mt-6">
                <div className="space-y-4">
                  {resumeRequests.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No service requests</h3>
                        <p className="text-muted-foreground mb-4">Get professional help with your resume!</p>
                        <Link to="/#services">
                          <Button variant="gradient">View Services</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    resumeRequests.map((request) => (
                      <Card key={request.id} className="glass-card">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{getServiceLabel(request.service_type)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Requested on {new Date(request.requested_at).toLocaleDateString()}
                              </p>
                              {request.admin_feedback && (
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium">Feedback:</p>
                                  <p className="text-sm text-muted-foreground">{request.admin_feedback}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(request.status || 'pending')}
                              <Badge 
                                className={request.payment_status === 'paid' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : 'bg-yellow-500/10 text-yellow-500'}
                              >
                                {request.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

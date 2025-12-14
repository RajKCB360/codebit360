import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  experience_level: string;
  skills: string[];
  responsibilities: string | null;
  eligibility: string | null;
  apply_url: string;
  source: string | null;
  created_at: string;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      toast({ title: 'Error', description: 'Job not found', variant: 'destructive' });
      navigate('/jobs');
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${job?.job_title} at ${job?.company_name}`,
        text: `Check out this job opportunity: ${job?.job_title} at ${job?.company_name}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied!', description: 'Job link copied to clipboard' });
    }
  };

  const jobStructuredData = useMemo(() => {
    if (!job) return null;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.job_title,
      "description": `${job.responsibilities || ""} Eligibility: ${job.eligibility || "Open to all eligible candidates"}`,
      "datePosted": job.created_at,
      "employmentType": job.job_type === "Internship" ? "INTERN" : job.job_type === "Part-time" ? "PART_TIME" : "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company_name,
        "sameAs": job.apply_url
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location
        }
      },
      "skills": job.skills.join(", "),
      "qualifications": job.eligibility || "Open to freshers and students",
      "directApply": false
    };
  }, [job]);

  const seoTitle = job 
    ? `${job.job_title} at ${job.company_name} - Apply Now | CodeBit360`
    : "Job Details | CodeBit360";
  
  const seoDescription = job
    ? `Apply for ${job.job_title} at ${job.company_name} in ${job.location}. ${job.job_type} role for ${job.experience_level}. Skills: ${job.skills.slice(0, 3).join(", ")}. Apply via CodeBit360.`
    : "View job details and apply on CodeBit360";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${job.job_title}, ${job.company_name} jobs, ${job.skills.join(", ")}, fresher jobs, ${job.location} jobs`}
        canonicalUrl={`/jobs/${job.id}`}
        ogType="article"
        structuredData={jobStructuredData || undefined}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <Link to="/jobs">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>

            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl mb-6"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.job_title}</h1>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground">
                    <Building2 className="w-5 h-5" />
                    <span>{job.company_name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-primary/10 text-primary px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.job_type}
                </Badge>
                <Badge className="bg-secondary/10 text-secondary px-3 py-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {job.experience_level}
                </Badge>
                <Badge className="bg-accent/10 text-accent px-3 py-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location}
                </Badge>
              </div>

              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                <Button variant="gradient" size="lg" className="w-full md:w-auto">
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </motion.div>

            {/* Job Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Required Skills */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Job Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.responsibilities.split('.').filter(Boolean).map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                          <span className="text-muted-foreground">{resp.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Eligibility */}
              {job.eligibility && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Eligibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{job.eligibility}</p>
                  </CardContent>
                </Card>
              )}

              {/* Why Apply via CodeBit360 */}
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">Why Apply via CodeBit360?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Curated specifically for freshers & students</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Resume tips & templates available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Interview preparation guidance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Skill-building courses to boost your profile</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Apply Button */}
              <div className="text-center">
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="gradient" size="lg">
                    Apply on {job.source || 'Company Website'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>

              {/* Disclaimer */}
              <Card className="bg-muted/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Disclaimer</p>
                      <p className="text-sm text-muted-foreground">
                        CodeBit360 is not the hiring company. We curate job listings to help students 
                        discover opportunities. Clicking "Apply" will redirect you to the official 
                        job posting on {job.source || 'the company website'}. Always verify job details 
                        on the company's official career page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;

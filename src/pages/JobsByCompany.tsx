import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Building2, ArrowLeft, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  experience_level: string;
  skills: string[];
  created_at: string;
}

interface CompanyInfo {
  name: string;
  jobCount: number;
}

const JobsByCompany = () => {
  const { company } = useParams<{ company: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const decodedCompany = company ? decodeURIComponent(company) : null;

  useEffect(() => {
    fetchJobs();
  }, [company]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, job_title, company_name, location, job_type, experience_level, skills, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Get unique companies with job counts
      const companyMap = new Map<string, number>();
      data.forEach(job => {
        companyMap.set(job.company_name, (companyMap.get(job.company_name) || 0) + 1);
      });
      const companyList = Array.from(companyMap.entries())
        .map(([name, jobCount]) => ({ name, jobCount }))
        .sort((a, b) => b.jobCount - a.jobCount);
      setCompanies(companyList);

      // Filter by company if provided
      if (decodedCompany) {
        setJobs(data.filter(job => 
          job.company_name.toLowerCase() === decodedCompany.toLowerCase()
        ));
      } else {
        setJobs(data);
      }
    }
    setLoading(false);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={decodedCompany ? `${decodedCompany} Jobs | CodeBit360` : 'Jobs by Company | CodeBit360'}
        description={decodedCompany ? `Find jobs at ${decodedCompany} for freshers and students.` : 'Browse tech jobs by company. Find opportunities at top tech companies.'}
        canonicalUrl={company ? `/jobs/company/${company}` : '/jobs/companies'}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {decodedCompany ? (
                  <>Jobs at <span className="gradient-text">{decodedCompany}</span></>
                ) : (
                  <>Browse Jobs by <span className="gradient-text">Company</span></>
                )}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {decodedCompany 
                ? `${jobs.length} jobs found at ${decodedCompany}`
                : `${companies.length} companies hiring`
              }
            </p>
          </motion.div>

          {!decodedCompany ? (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((c, index) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/jobs/company/${encodeURIComponent(c.name)}`}>
                      <Card className="glass-card hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{c.name}</CardTitle>
                              <CardDescription>{c.jobCount} open position{c.jobCount !== 1 ? 's' : ''}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {filteredCompanies.length === 0 && (
                <div className="text-center py-16">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </>
          ) : (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
                      <CardContent><div className="h-4 bg-muted rounded w-full"></div></CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">No active jobs at {decodedCompany}</p>
                  <Link to="/jobs/companies">
                    <Button>Browse All Companies</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link to={`/jobs/${job.id}`}>
                        <Card className="glass-card h-full hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                                {job.job_title}
                              </CardTitle>
                              <Badge variant={job.job_type === 'Internship' ? 'secondary' : 'default'}>
                                {job.job_type}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-3 mb-4 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{job.experience_level}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {job.skills.slice(0, 3).map(s => (
                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobsByCompany;

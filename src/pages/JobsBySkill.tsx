import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Building2, ArrowLeft, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const JobsBySkill = () => {
  const { skill } = useParams<{ skill: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [skill]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, job_title, company_name, location, job_type, experience_level, skills, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Extract unique skills
      const skills = new Set<string>();
      data.forEach(job => job.skills.forEach(s => skills.add(s)));
      setAllSkills(Array.from(skills).sort());

      // Filter by skill if provided
      if (skill) {
        const decodedSkill = decodeURIComponent(skill);
        setJobs(data.filter(job => 
          job.skills.some(s => s.toLowerCase() === decodedSkill.toLowerCase())
        ));
      } else {
        setJobs(data);
      }
    }
    setLoading(false);
  };

  const filteredSkills = allSkills.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const decodedSkill = skill ? decodeURIComponent(skill) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={decodedSkill ? `${decodedSkill} Jobs | CodeBit360` : 'Jobs by Skill | CodeBit360'}
        description={decodedSkill ? `Find ${decodedSkill} jobs for freshers and students. Browse curated opportunities.` : 'Browse tech jobs by skill. Find opportunities matching your expertise.'}
        canonicalUrl={skill ? `/jobs/skill/${skill}` : '/jobs/skills'}
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
              <Code className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {decodedSkill ? (
                  <>Jobs requiring <span className="gradient-text">{decodedSkill}</span></>
                ) : (
                  <>Browse Jobs by <span className="gradient-text">Skill</span></>
                )}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {decodedSkill 
                ? `${jobs.length} jobs found requiring ${decodedSkill}`
                : 'Select a skill to find matching opportunities'
              }
            </p>
          </motion.div>

          {!decodedSkill ? (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredSkills.map((s, index) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Link to={`/jobs/skill/${encodeURIComponent(s)}`}>
                      <Badge 
                        variant="outline" 
                        className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                      >
                        {s}
                      </Badge>
                    </Link>
                  </motion.div>
                ))}
              </div>
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
                  <Code className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">No jobs found requiring {decodedSkill}</p>
                  <Link to="/jobs/skills">
                    <Button>Browse All Skills</Button>
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
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {job.job_title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              <span className="truncate">{job.company_name}</span>
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
                                <Badge 
                                  key={s} 
                                  variant={s.toLowerCase() === decodedSkill.toLowerCase() ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {s}
                                </Badge>
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

export default JobsBySkill;

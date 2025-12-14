import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Building2, ArrowLeft, Layers, Briefcase } from 'lucide-react';
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

const categories = [
  { id: 'ai-ml', name: 'AI & Machine Learning', keywords: ['AI', 'Machine Learning', 'ML', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch'], icon: '🤖', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'data-science', name: 'Data Science & Analytics', keywords: ['Data Science', 'Data Analyst', 'Analytics', 'SQL', 'Python', 'Power BI', 'Tableau', 'Data Engineer'], icon: '📊', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'web-dev', name: 'Web Development', keywords: ['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Frontend', 'Full Stack', 'HTML', 'CSS'], icon: '🌐', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'mobile-dev', name: 'Mobile Development', keywords: ['Android', 'iOS', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile'], icon: '📱', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'cloud-devops', name: 'Cloud & DevOps', keywords: ['AWS', 'Azure', 'GCP', 'Cloud', 'DevOps', 'Kubernetes', 'Docker', 'CI/CD', 'Jenkins'], icon: '☁️', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'cybersecurity', name: 'Cybersecurity', keywords: ['Security', 'Cybersecurity', 'Penetration', 'SOC', 'Network Security', 'SIEM'], icon: '🔒', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'backend', name: 'Backend Development', keywords: ['Java', 'Python', 'Go', 'Rust', 'Backend', '.NET', 'C#', 'Microservices', 'API'], icon: '⚙️', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'testing', name: 'QA & Testing', keywords: ['QA', 'Testing', 'Automation', 'Selenium', 'SDET', 'Quality Assurance', 'Test Engineer'], icon: '🧪', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
];

const JobsByCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const selectedCategory = categories.find(c => c.id === category);

  useEffect(() => {
    fetchJobs();
  }, [category]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, job_title, company_name, location, job_type, experience_level, skills, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Count jobs per category
      const counts: Record<string, number> = {};
      categories.forEach(cat => {
        counts[cat.id] = data.filter(job => 
          cat.keywords.some(kw => 
            job.job_title.toLowerCase().includes(kw.toLowerCase()) ||
            job.skills.some(s => s.toLowerCase().includes(kw.toLowerCase()))
          )
        ).length;
      });
      setCategoryCounts(counts);

      // Filter by category if selected
      if (selectedCategory) {
        setJobs(data.filter(job => 
          selectedCategory.keywords.some(kw => 
            job.job_title.toLowerCase().includes(kw.toLowerCase()) ||
            job.skills.some(s => s.toLowerCase().includes(kw.toLowerCase()))
          )
        ));
      } else {
        setJobs(data);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={selectedCategory ? `${selectedCategory.name} Jobs | CodeBit360` : 'Jobs by Category | CodeBit360'}
        description={selectedCategory ? `Find ${selectedCategory.name} jobs for freshers and students.` : 'Browse tech jobs by category. AI, Data Science, Web Development and more.'}
        canonicalUrl={category ? `/jobs/category/${category}` : '/jobs/categories'}
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
              <Layers className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                {selectedCategory ? (
                  <><span className="mr-2">{selectedCategory.icon}</span>{selectedCategory.name} Jobs</>
                ) : (
                  <>Browse Jobs by <span className="gradient-text">Category</span></>
                )}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {selectedCategory 
                ? `${jobs.length} jobs found in ${selectedCategory.name}`
                : 'Select a category to find matching opportunities'
              }
            </p>
          </motion.div>

          {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/jobs/category/${cat.id}`}>
                    <Card className="glass-card hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer h-full">
                      <CardHeader>
                        <div className="text-4xl mb-2">{cat.icon}</div>
                        <CardTitle className="text-lg">{cat.name}</CardTitle>
                        <CardDescription>
                          {categoryCounts[cat.id] || 0} jobs available
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {cat.keywords.slice(0, 4).map(kw => (
                            <Badge key={kw} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
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
                  <p className="text-muted-foreground mb-4">No jobs found in {selectedCategory.name}</p>
                  <Link to="/jobs/categories">
                    <Button>Browse All Categories</Button>
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
                              <Badge className={selectedCategory.color}>{job.job_type}</Badge>
                            </div>
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

export default JobsByCategory;

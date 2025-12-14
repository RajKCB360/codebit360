import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Award, IndianRupee, Code, Database, Cloud, Brain, Globe, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

interface Internship {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  skills: string[] | null;
  has_certificate: boolean | null;
  is_paid: boolean | null;
  price: number | null;
}

const domains = [
  { id: 'software-development', name: 'Software Development', keywords: ['developer', 'software', 'programming', 'coding'], icon: Code, color: 'brand-indigo' },
  { id: 'data-science', name: 'Data Science', keywords: ['data', 'analytics', 'visualization', 'sql'], icon: Database, color: 'brand-cyan' },
  { id: 'ai-ml', name: 'AI & Machine Learning', keywords: ['ai', 'ml', 'machine learning', 'deep learning', 'neural'], icon: Brain, color: 'brand-purple' },
  { id: 'cloud-devops', name: 'Cloud & DevOps', keywords: ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes'], icon: Cloud, color: 'brand-orange' },
  { id: 'web-development', name: 'Web Development', keywords: ['web', 'frontend', 'backend', 'react', 'node', 'full stack'], icon: Globe, color: 'brand-green' },
  { id: 'python', name: 'Python Development', keywords: ['python', 'django', 'flask'], icon: Server, color: 'secondary' },
];

const InternshipsByDomain = () => {
  const { domain } = useParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const currentDomain = domains.find(d => d.id === domain);

  useEffect(() => {
    fetchInternships();
  }, [domain]);

  const fetchInternships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('internships')
      .select('id, title, description, duration, skills, has_certificate, is_paid, price')
      .eq('is_active', true);

    if (!error && data) {
      // Count internships per domain
      const counts: Record<string, number> = {};
      domains.forEach(d => {
        counts[d.id] = data.filter(internship => {
          const titleLower = internship.title.toLowerCase();
          const descLower = internship.description?.toLowerCase() || '';
          const skillsLower = internship.skills?.join(' ').toLowerCase() || '';
          const searchText = `${titleLower} ${descLower} ${skillsLower}`;
          return d.keywords.some(keyword => searchText.includes(keyword));
        }).length;
      });
      setDomainCounts(counts);

      // Filter by domain if provided
      if (domain && currentDomain) {
        const filtered = data.filter(internship => {
          const titleLower = internship.title.toLowerCase();
          const descLower = internship.description?.toLowerCase() || '';
          const skillsLower = internship.skills?.join(' ').toLowerCase() || '';
          const searchText = `${titleLower} ${descLower} ${skillsLower}`;
          return currentDomain.keywords.some(keyword => searchText.includes(keyword));
        });
        setInternships(filtered);
      } else {
        setInternships(data);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={currentDomain ? `${currentDomain.name} Internships | CodeBit360` : 'Browse Internships by Domain | CodeBit360'}
        description={currentDomain ? `Find ${currentDomain.name} internships with certificates.` : 'Browse virtual internships by domain. Find internships in Software, Data Science, AI/ML, Cloud, and more.'}
        canonicalUrl={domain ? `/internships/domain/${domain}` : '/internships/domains'}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to="/internships">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Internships
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              {currentDomain ? currentDomain.name : 'All Domains'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {currentDomain ? (
                <><span className="gradient-text">{currentDomain.name}</span> Internships</>
              ) : (
                <>Browse Internships by <span className="gradient-text">Domain</span></>
              )}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentDomain ? `Explore virtual internships in ${currentDomain.name}` : 'Select a domain to find matching internships'}
            </p>
          </motion.div>

          {!domain ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {domains.map((d, index) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/internships/domain/${d.id}`}>
                      <Card className={`glass-card h-full hover:shadow-xl transition-all cursor-pointer group bg-${d.color}/5 border-${d.color}/20 hover:border-${d.color}/40`}>
                        <CardContent className="pt-6 text-center">
                          <div className={`w-16 h-16 rounded-2xl bg-${d.color}/10 flex items-center justify-center mx-auto mb-4`}>
                            <Icon className={`w-8 h-8 text-${d.color}`} />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-secondary transition-colors">
                            {d.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {domainCounts[d.id] || 0} internships
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : internships.length === 0 ? (
                <div className="text-center py-16">
                  <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No internships found in {currentDomain?.name}</h3>
                  <p className="text-muted-foreground mb-4">Try browsing other domains</p>
                  <Link to="/internships/domains">
                    <Button variant="outline">Browse All Domains</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map((internship, index) => (
                    <motion.div
                      key={internship.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link to={`/internships/${internship.id}`}>
                        <Card className="glass-card h-full hover:shadow-xl hover:border-secondary/30 transition-all cursor-pointer group">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <CardTitle className="text-lg group-hover:text-secondary transition-colors line-clamp-2">
                                {internship.title}
                              </CardTitle>
                              {internship.has_certificate && (
                                <span className="shrink-0 inline-flex items-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 text-xs font-semibold">
                                  <Award className="w-3 h-3 mr-1" />
                                  Cert
                                </span>
                              )}
                            </div>
                            {internship.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {internship.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-3 mb-4 text-sm">
                              {internship.duration && (
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5" />
                                  {internship.duration}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <IndianRupee className="w-3.5 h-3.5" />
                                {internship.is_paid && internship.price ? `₹${internship.price}` : 'Free'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {internship.skills?.slice(0, 3).map(skill => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                                >
                                  {skill}
                                </span>
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

export default InternshipsByDomain;

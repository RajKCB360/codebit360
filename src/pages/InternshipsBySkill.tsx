import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Clock, Award, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const InternshipsBySkill = () => {
  const { skill } = useParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInternships();
  }, [skill]);

  const fetchInternships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('internships')
      .select('id, title, description, duration, skills, has_certificate, is_paid, price')
      .eq('is_active', true);

    if (!error && data) {
      // Extract all unique skills
      const skills = new Set<string>();
      data.forEach(internship => {
        internship.skills?.forEach(s => skills.add(s));
      });
      setAllSkills(Array.from(skills).sort());

      // Filter by skill if provided
      if (skill) {
        const filtered = data.filter(internship =>
          internship.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        setInternships(filtered);
      } else {
        setInternships(data);
      }
    }
    setLoading(false);
  };

  const filteredSkills = allSkills.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={skill ? `${skill} Internships | CodeBit360` : 'Browse Internships by Skill | CodeBit360'}
        description={skill ? `Find ${skill} internships. Virtual internships with certificates.` : 'Browse virtual internships by skill. Find the perfect internship for your learning goals.'}
        canonicalUrl={skill ? `/internships/skill/${skill}` : '/internships/skills'}
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
              {skill ? skill : 'All Skills'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {skill ? (
                <>Internships for <span className="gradient-text">{skill}</span></>
              ) : (
                <>Browse Internships by <span className="gradient-text">Skill</span></>
              )}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {skill ? `Explore virtual internships that teach ${skill}` : 'Select a skill to find matching internships'}
            </p>
          </motion.div>

          {!skill ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-md mx-auto mb-8"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {filteredSkills.map((s) => (
                  <Link key={s} to={`/internships/skill/${encodeURIComponent(s)}`}>
                    <Badge
                      variant="outline"
                      className="text-base py-2 px-4 cursor-pointer hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all"
                    >
                      {s}
                    </Badge>
                  </Link>
                ))}
                {filteredSkills.length === 0 && (
                  <p className="text-muted-foreground">No skills found</p>
                )}
              </motion.div>
            </>
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
                  <h3 className="text-xl font-semibold mb-2">No internships found for {skill}</h3>
                  <p className="text-muted-foreground mb-4">Try browsing other skills</p>
                  <Link to="/internships/skills">
                    <Button variant="outline">Browse All Skills</Button>
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
                            <CardTitle className="text-lg group-hover:text-secondary transition-colors line-clamp-2">
                              {internship.title}
                            </CardTitle>
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
                              {internship.skills?.slice(0, 3).map(s => (
                                <span
                                  key={s}
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                                    s.toLowerCase() === skill?.toLowerCase()
                                      ? 'bg-secondary/10 text-secondary border-secondary/30'
                                      : 'border-border bg-muted/50 text-muted-foreground'
                                  }`}
                                >
                                  {s}
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

export default InternshipsBySkill;

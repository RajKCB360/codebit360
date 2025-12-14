import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Award, Clock, Code, Layers, Building2, ChevronRight, IndianRupee, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  created_at: string | null;
}

const Internships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select('id, title, description, duration, skills, has_certificate, is_paid, price, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInternships(data);
    }
    setLoading(false);
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (internship.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);
    
    const matchesDuration = durationFilter === 'all' || internship.duration?.includes(durationFilter);
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === 'free' && (!internship.is_paid || internship.price === 0)) ||
      (priceFilter === 'paid' && internship.is_paid && internship.price && internship.price > 0);

    return matchesSearch && matchesDuration && matchesPrice;
  });

  const internshipListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Virtual Internships - CodeBit360",
    "description": "Task-based virtual internships with certificates for CS/IT students",
    "itemListElement": filteredInternships.slice(0, 10).map((internship, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "name": internship.title,
        "description": internship.description,
        "provider": {
          "@type": "Organization",
          "name": "CodeBit360"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Virtual Internships for Students | CodeBit360"
        description="Gain real work experience with task-based virtual internships. Get mentored, complete projects, and earn verified certificates. Perfect for CS/IT students."
        keywords="virtual internship, online internship, internship for students, tech internship, certificate internship, work from home internship"
        canonicalUrl="/internships"
        structuredData={internshipListStructuredData}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Virtual Internships
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gain Real <span className="gradient-text">Work Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Task-based virtual internships with industry-standard practices. Complete projects, get mentored, and earn verified certificates.
            </p>
          </motion.div>

          {/* Browse By Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap gap-3 mb-8 justify-center"
          >
            <Link to="/internships/skills">
              <Button variant="outline" className="gap-2 hover:bg-secondary/10 hover:border-secondary/30">
                <Code className="w-4 h-4" />
                Browse by Skill
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/internships/domains">
              <Button variant="outline" className="gap-2 hover:bg-secondary/10 hover:border-secondary/30">
                <Layers className="w-4 h-4" />
                Browse by Domain
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search internships, skills, or domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="6">6 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Quick Filter Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            {/* Popular Skills */}
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Popular Skills</p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'React', 'Java', 'Data Science', 'Machine Learning', 'Web Development', 'Cloud', 'DevOps'].map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:bg-secondary hover:text-secondary-foreground hover:border-secondary ${
                      searchTerm.toLowerCase() === skill.toLowerCase() 
                        ? 'bg-secondary text-secondary-foreground border-secondary' 
                        : ''
                    }`}
                    onClick={() => setSearchTerm(searchTerm.toLowerCase() === skill.toLowerCase() ? '' : skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Popular Domains */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Popular Domains</p>
              <div className="flex flex-wrap gap-2">
                {['Software Development', 'Data Analytics', 'AI/ML', 'Cloud Computing', 'Full Stack', 'Backend'].map((domain) => (
                  <Badge
                    key={domain}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                      searchTerm.toLowerCase() === domain.toLowerCase() 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : ''
                    }`}
                    onClick={() => setSearchTerm(searchTerm.toLowerCase() === domain.toLowerCase() ? '' : domain)}
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredInternships.length}</span> internships
              {searchTerm && (
                <span className="ml-2">
                  for "<span className="text-secondary">{searchTerm}</span>"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-xs underline hover:no-underline"
                  >
                    Clear
                  </button>
                </span>
              )}
            </p>
          </div>

          {/* Internship Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-center py-16">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No internships found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship, index) => (
                <motion.div
                  key={internship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/internships/${internship.id}`}>
                    <Card className="glass-card h-full hover:shadow-xl hover:border-secondary/30 transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-secondary transition-colors line-clamp-2">
                              {internship.title}
                            </CardTitle>
                            {internship.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {internship.description}
                              </p>
                            )}
                          </div>
                          {internship.has_certificate && (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-0.5 text-xs font-semibold">
                              <Award className="w-3 h-3 mr-1" />
                              Certificate
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3 mb-4 text-sm">
                          {internship.duration && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{internship.duration}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>{internship.is_paid && internship.price ? `₹${internship.price}` : 'Free'}</span>
                          </div>
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
                          {internship.skills && internship.skills.length > 3 && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              +{internship.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="text-center p-6 bg-secondary/5 border-secondary/20">
              <Award className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="font-semibold mb-2">Verified Certificates</h3>
              <p className="text-sm text-muted-foreground">Industry-recognized certificates upon successful completion</p>
            </Card>
            <Card className="text-center p-6 bg-primary/5 border-primary/20">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Real Projects</h3>
              <p className="text-sm text-muted-foreground">Work on industry-standard projects with mentor guidance</p>
            </Card>
            <Card className="text-center p-6 bg-brand-green/5 border-brand-green/20">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-brand-green" />
              <h3 className="font-semibold mb-2">Portfolio Ready</h3>
              <p className="text-sm text-muted-foreground">Build projects to showcase in your resume and portfolio</p>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Internships;

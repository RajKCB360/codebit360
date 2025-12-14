import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Building2, Code, Layers, ChevronRight } from 'lucide-react';
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

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, job_title, company_name, location, job_type, experience_level, skills, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJobType = jobTypeFilter === 'all' || job.job_type === jobTypeFilter;
    const matchesLocation = locationFilter === 'all' || job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesJobType && matchesLocation;
  });

  const uniqueLocations = [...new Set(jobs.map(job => job.location.split(',')[0].trim()))];

  const jobListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Tech Jobs for Freshers - CodeBit360",
    "description": "Curated tech job listings for CS/IT students and freshers",
    "itemListElement": filteredJobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.job_title,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company_name
        },
        "jobLocation": {
          "@type": "Place",
          "address": job.location
        },
        "employmentType": job.job_type === "Internship" ? "INTERN" : "FULL_TIME"
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tech Jobs for Freshers & Students | CodeBit360 Job Portal"
        description="Browse curated tech job listings for CS/IT students. Find internships, fresher jobs at top companies like TCS, Infosys, Google. Apply now!"
        keywords="fresher jobs, tech internships, IT jobs India, CS student jobs, entry level developer jobs, software engineer fresher"
        canonicalUrl="/jobs"
        structuredData={jobListStructuredData}
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
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Job Portal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Curated <span className="gradient-text">Tech Jobs</span> for Students
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked opportunities from top companies. Fresher-friendly roles updated daily.
            </p>
          </motion.div>

          {/* Browse By Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap gap-3 mb-8 justify-center"
          >
            <Link to="/jobs/skills">
              <Button variant="outline" className="gap-2 hover:bg-primary/10 hover:border-primary/30">
                <Code className="w-4 h-4" />
                Browse by Skill
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/jobs/categories">
              <Button variant="outline" className="gap-2 hover:bg-primary/10 hover:border-primary/30">
                <Layers className="w-4 h-4" />
                Browse by Category
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/jobs/companies">
              <Button variant="outline" className="gap-2 hover:bg-primary/10 hover:border-primary/30">
                <Building2 className="w-4 h-4" />
                Browse by Company
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

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
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
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
                {['React', 'Python', 'Java', 'JavaScript', 'Node.js', 'SQL', 'AWS', 'Machine Learning', 'Data Science', 'DevOps'].map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                      searchTerm.toLowerCase() === skill.toLowerCase() 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : ''
                    }`}
                    onClick={() => setSearchTerm(searchTerm.toLowerCase() === skill.toLowerCase() ? '' : skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Popular Categories</p>
              <div className="flex flex-wrap gap-2">
                {['Developer', 'Data Analyst', 'Cloud Engineer', 'Full Stack', 'Backend', 'Frontend', 'QA', 'AI/ML'].map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:bg-secondary hover:text-secondary-foreground hover:border-secondary ${
                      searchTerm.toLowerCase() === category.toLowerCase() 
                        ? 'bg-secondary text-secondary-foreground border-secondary' 
                        : ''
                    }`}
                    onClick={() => setSearchTerm(searchTerm.toLowerCase() === category.toLowerCase() ? '' : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> jobs
              {searchTerm && (
                <span className="ml-2">
                  for "<span className="text-primary">{searchTerm}</span>"
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

          {/* Job Cards */}
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
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/jobs/${job.id}`}>
                    <Card className="glass-card h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {job.job_title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                              <Building2 className="w-4 h-4 shrink-0" />
                              <span className="truncate">{job.company_name}</span>
                            </div>
                          </div>
                          <span 
                            className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              job.job_type === 'Internship' 
                                ? 'bg-secondary/10 text-secondary border-secondary/20' 
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            {job.job_type}
                          </span>
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
                          {job.skills.slice(0, 3).map(skill => (
                            <span 
                              key={skill} 
                              className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              +{job.skills.length - 3}
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

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-4 rounded-lg bg-muted/50 border border-border text-center"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> CodeBit360 is not the hiring company. 
              We curate and redirect you to official job sources. 
              Always verify details on the company's official career page.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;

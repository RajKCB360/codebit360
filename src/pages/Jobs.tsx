import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

          {/* Search & Filters */}
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

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> jobs
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
                >
                  <Link to={`/jobs/${job.id}`}>
                    <Card className="glass-card h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {job.job_title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company_name}</span>
                            </div>
                          </div>
                          <Badge 
                            className={job.job_type === 'Internship' 
                              ? 'bg-secondary/10 text-secondary' 
                              : 'bg-primary/10 text-primary'}
                          >
                            {job.job_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {job.experience_level}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3}
                            </Badge>
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

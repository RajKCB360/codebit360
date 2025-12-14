import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, Clock, IndianRupee, CheckCircle, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Internship {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  skills: string[] | null;
  tasks: unknown;
  has_certificate: boolean | null;
  is_paid: boolean | null;
  price: number | null;
  created_at: string | null;
}

const InternshipDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college: '',
    year: '',
    skills: '',
  });

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      setInternship(data);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }

    if (!formData.full_name || !formData.email) {
      toast.error('Please fill required fields');
      return;
    }

    setApplying(true);
    const { error } = await supabase.from('internship_applications').insert({
      internship_id: id,
      user_id: user.id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      year: formData.year,
      skills: formData.skills,
    });

    if (error) {
      toast.error('Failed to submit application');
    } else {
      toast.success('Application submitted successfully!');
      setDialogOpen(false);
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Internship not found</h1>
            <Link to="/internships">
              <Button>Browse Internships</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tasks = Array.isArray(internship.tasks) ? internship.tasks : [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${internship.title} | Virtual Internship - CodeBit360`}
        description={internship.description || `Apply for ${internship.title} virtual internship. Duration: ${internship.duration}. Get certified.`}
        keywords={`${internship.title}, virtual internship, ${internship.skills?.join(', ')}`}
        canonicalUrl={`/internships/${id}`}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl md:text-3xl mb-2">{internship.title}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-muted-foreground">
                        {internship.duration && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {internship.duration}
                          </span>
                        )}
                        {internship.has_certificate && (
                          <span className="flex items-center gap-1.5 text-brand-green">
                            <Award className="w-4 h-4" />
                            Certificate Included
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {internship.description && (
                    <div>
                      <h3 className="font-semibold mb-3">About This Internship</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{internship.description}</p>
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Tasks & Deliverables</h3>
                      <ul className="space-y-2">
                        {tasks.map((task: any, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-brand-green mt-1 shrink-0" />
                            <span>{typeof task === 'string' ? task : task.title || task.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {internship.skills && internship.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Skills You'll Learn</h3>
                      <div className="flex flex-wrap gap-2">
                        {internship.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card sticky top-24">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {internship.is_paid && internship.price ? `₹${internship.price}` : 'Free'}
                    </div>
                    <p className="text-sm text-muted-foreground">One-time fee</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-secondary" />
                      <span>Duration: {internship.duration || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-5 h-5 text-secondary" />
                      <span>Mentor Support Included</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-5 h-5 text-secondary" />
                      <span>Task-based Learning</span>
                    </div>
                    {internship.has_certificate && (
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="w-5 h-5 text-brand-green" />
                        <span>Verified Certificate</span>
                      </div>
                    )}
                  </div>

                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {internship.title}</DialogTitle>
                        <DialogDescription>
                          Fill in your details to submit your application
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="college">College/University</Label>
                          <Input
                            id="college"
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="year">Year of Study</Label>
                          <Input
                            id="year"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="skills">Your Skills</Label>
                          <Textarea
                            id="skills"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="List your relevant skills..."
                          />
                        </div>
                        <Button onClick={handleApply} disabled={applying} className="w-full">
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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

export default InternshipDetail;

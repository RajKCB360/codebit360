import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  is_active: boolean | null;
}

const AdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Fresher',
    skills: '',
    responsibilities: '',
    eligibility: '',
    apply_url: '',
    source: 'Company Website',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch jobs', variant: 'destructive' });
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingJob) {
      const { error } = await supabase
        .from('jobs')
        .update(submitData)
        .eq('id', editingJob.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Job updated successfully' });
        fetchJobs();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from('jobs').insert([submitData]);

      if (error) {
        toast({ title: 'Error', description: 'Failed to create job', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Job created successfully' });
        fetchJobs();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      job_title: job.job_title,
      company_name: job.company_name,
      location: job.location,
      job_type: job.job_type,
      experience_level: job.experience_level,
      skills: job.skills?.join(', ') || '',
      responsibilities: job.responsibilities || '',
      eligibility: job.eligibility || '',
      apply_url: job.apply_url,
      source: job.source || 'Company Website',
      is_active: job.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete job', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Job deleted successfully' });
      fetchJobs();
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      job_title: '',
      company_name: '',
      location: '',
      job_type: 'Full-time',
      experience_level: 'Fresher',
      skills: '',
      responsibilities: '',
      eligibility: '',
      apply_url: '',
      source: 'Company Website',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Jobs</h2>
          <p className="text-muted-foreground">Add and curate job listings for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g., Software Developer Intern"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., TCS"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Bangalore, India"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select 
                    value={formData.job_type} 
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select 
                    value={formData.experience_level} 
                    onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fresher">Fresher</SelectItem>
                      <SelectItem value="0-1 Years">0-1 Years</SelectItem>
                      <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                      <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select 
                    value={formData.source} 
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company Website">Company Website</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Naukri">Naukri</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills (comma-separated) *</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Python, JavaScript, SQL, React"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <Textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Develop software applications. Collaborate with team. Write clean code."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Eligibility</Label>
                <Textarea
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  placeholder="B.Tech/BE in CS/IT, 2024-2025 batch"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Apply URL (External Link) *</Label>
                <Input
                  value={formData.apply_url}
                  onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                  placeholder="https://careers.company.com/job/123"
                  type="url"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active (visible to students)</Label>
              </div>

              <Button type="submit" className="w-full" variant="gradient">
                {editingJob ? 'Update Job' : 'Create Job'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{job.job_title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground mt-1">{job.company_name} • {job.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(job)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{job.job_type}</Badge>
                  <Badge variant="outline">{job.experience_level}</Badge>
                  <Badge variant="outline">{job.source}</Badge>
                  {!job.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.skills?.slice(0, 4).map(skill => (
                    <Badge key={skill} className="bg-primary/10 text-primary text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <a 
                  href={job.apply_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-3"
                >
                  <ExternalLink className="w-3 h-3" />
                  {job.apply_url.substring(0, 40)}...
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No jobs found. Add your first job listing!
        </div>
      )}
    </div>
  );
};

export default AdminJobs;

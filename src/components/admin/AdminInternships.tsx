import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
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
  is_active: boolean | null;
}

const AdminInternships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    skills: '',
    has_certificate: true,
    is_paid: false,
    price: 0,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch internships', variant: 'destructive' });
    } else {
      setInternships(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingInternship) {
      const { error } = await supabase
        .from('internships')
        .update(submitData)
        .eq('id', editingInternship.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update internship', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Internship updated successfully' });
        fetchInternships();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from('internships').insert([submitData]);

      if (error) {
        toast({ title: 'Error', description: 'Failed to create internship', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Internship created successfully' });
        fetchInternships();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (internship: Internship) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      description: internship.description || '',
      duration: internship.duration || '',
      skills: internship.skills?.join(', ') || '',
      has_certificate: internship.has_certificate ?? true,
      is_paid: internship.is_paid ?? false,
      price: internship.price || 0,
      is_active: internship.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;

    const { error } = await supabase.from('internships').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete internship', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Internship deleted successfully' });
      fetchInternships();
    }
  };

  const resetForm = () => {
    setEditingInternship(null);
    setFormData({
      title: '',
      description: '',
      duration: '',
      skills: '',
      has_certificate: true,
      is_paid: false,
      price: 0,
      is_active: true,
    });
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading internships...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Internships</h2>
          <p className="text-muted-foreground">Add, edit, or remove internship programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInternship ? 'Edit Internship' : 'Add New Internship'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 6 weeks"
                />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Python, JavaScript, React"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.has_certificate}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_certificate: checked })}
                  />
                  <Label>Certificate</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                  />
                  <Label>Paid</Label>
                </div>
              </div>
              {formData.is_paid && (
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active (visible to students)</Label>
              </div>
              <Button type="submit" className="w-full" variant="gradient">
                {editingInternship ? 'Update Internship' : 'Create Internship'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {internships.map((internship, index) => (
          <motion.div
            key={internship.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-secondary" />
                    <CardTitle className="text-lg">{internship.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(internship)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(internship.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {internship.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">{internship.duration}</Badge>
                  {internship.has_certificate && (
                    <Badge className="bg-green-500/10 text-green-500">Certificate</Badge>
                  )}
                  {internship.is_paid && (
                    <Badge className="bg-primary/10 text-primary">₹{internship.price}</Badge>
                  )}
                  {!internship.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                {internship.skills && internship.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {internship.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {internship.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{internship.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {internships.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No internships found. Add your first internship program!
        </div>
      )}
    </div>
  );
};

export default AdminInternships;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, Clock, BookOpen, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Json } from '@/integrations/supabase/types';

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  link: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  syllabus: Json | null;
}

const CourseManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    link: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch course', variant: 'destructive' });
      navigate('/admin');
    } else {
      setCourse(data);
      // Parse syllabus as chapters
      if (data.syllabus && Array.isArray(data.syllabus)) {
        setChapters(data.syllabus as unknown as Chapter[]);
      }
    }
    setLoading(false);
  };

  const saveChapters = async (updatedChapters: Chapter[]) => {
    const { error } = await supabase
      .from('courses')
      .update({ syllabus: updatedChapters as unknown as Json })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save chapters', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedChapters: Chapter[];

    if (editingChapter) {
      updatedChapters = chapters.map(ch =>
        ch.id === editingChapter.id
          ? { ...ch, ...formData }
          : ch
      );
    } else {
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        ...formData,
        order: chapters.length + 1,
      };
      updatedChapters = [...chapters, newChapter];
    }

    const success = await saveChapters(updatedChapters);
    if (success) {
      setChapters(updatedChapters);
      toast({ title: 'Success', description: editingChapter ? 'Chapter updated' : 'Chapter added' });
      setDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description,
      duration: chapter.duration,
      link: chapter.link,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('Delete this chapter?')) return;

    const updatedChapters = chapters
      .filter(ch => ch.id !== chapterId)
      .map((ch, idx) => ({ ...ch, order: idx + 1 }));

    const success = await saveChapters(updatedChapters);
    if (success) {
      setChapters(updatedChapters);
      toast({ title: 'Success', description: 'Chapter deleted' });
    }
  };

  const resetForm = () => {
    setEditingChapter(null);
    setFormData({ title: '', description: '', duration: '', link: '' });
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    chapters.forEach(ch => {
      const match = ch.duration?.match(/(\d+)/);
      if (match) totalMinutes += parseInt(match[1]);
    });
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${totalMinutes}m`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{course?.title}</h1>
              <p className="text-muted-foreground mt-1">{course?.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">{course?.level}</Badge>
                <Badge variant="outline">{course?.duration}</Badge>
                <Badge className="bg-primary/10 text-primary">
                  <Clock className="w-3 h-3 mr-1" />
                  {getTotalDuration()} total
                </Badge>
              </div>
            </div>

            <Button variant="gradient" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Course Syllabus ({chapters.length} chapters)
          </h2>

          {chapters.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                No chapters yet. Add your first chapter to build the course syllabus.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {chapters
                .sort((a, b) => a.order - b.order)
                .map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="w-4 h-4" />
                            <span className="font-mono text-sm w-6">{chapter.order}.</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{chapter.title}</h3>
                              {chapter.link && (
                                <a
                                  href={chapter.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {chapter.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {chapter.duration}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(chapter)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(chapter.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Add/Edit Chapter Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Chapter Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to React"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this chapter covers"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 45 mins"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content Link</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" variant="gradient">
                {editingChapter ? 'Update Chapter' : 'Add Chapter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseManage;

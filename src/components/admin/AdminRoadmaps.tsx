import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, FileText, Link } from "lucide-react";

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  drive_link: string;
  preview_url: string | null;
  download_url: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

const CATEGORIES = ["AI", "Web Development", "Data Science", "DevOps", "Cloud", "Python", "Machine Learning", "Cybersecurity", "Mobile Development", "General"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];

export const AdminRoadmaps = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    level: "Beginner",
    drive_link: "",
    is_active: true,
  });

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["admin-roadmaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Roadmap[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("roadmaps").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      toast.success("Roadmap created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create roadmap: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("roadmaps").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      toast.success("Roadmap updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update roadmap: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roadmaps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      toast.success("Roadmap deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete roadmap: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("roadmaps").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      toast.success("Roadmap visibility updated");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "General",
      level: "Beginner",
      drive_link: "",
      is_active: true,
    });
    setEditingRoadmap(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    setFormData({
      title: roadmap.title,
      description: roadmap.description || "",
      category: roadmap.category,
      level: roadmap.level,
      drive_link: roadmap.drive_link,
      is_active: roadmap.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.drive_link) {
      toast.error("Please fill in required fields");
      return;
    }
    
    if (editingRoadmap) {
      updateMutation.mutate({ id: editingRoadmap.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roadmap Management</h2>
          <p className="text-muted-foreground">Manage career roadmaps with Google Drive PDF links</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Roadmap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRoadmap ? "Edit Roadmap" : "Add New Roadmap"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="AI Agent Developer Roadmap"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Step-by-step roadmap to become..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drive_link">Google Drive Link *</Label>
                <div className="flex gap-2">
                  <Link className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="drive_link"
                    value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    placeholder="https://drive.google.com/file/d/FILE_ID/view"
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste the Google Drive share link. Preview & download URLs will be auto-generated.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Publish immediately</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingRoadmap ? "Update" : "Create"} Roadmap
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Roadmaps ({roadmaps?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading roadmaps...</div>
          ) : roadmaps?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No roadmaps yet. Click "Add Roadmap" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roadmaps?.map((roadmap) => (
                  <TableRow key={roadmap.id}>
                    <TableCell className="font-medium">{roadmap.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roadmap.category}</Badge>
                    </TableCell>
                    <TableCell>{roadmap.level}</TableCell>
                    <TableCell>{roadmap.view_count}</TableCell>
                    <TableCell>
                      <Switch
                        checked={roadmap.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: roadmap.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {roadmap.preview_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(roadmap.preview_url!, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(roadmap)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this roadmap?")) {
                              deleteMutation.mutate(roadmap.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

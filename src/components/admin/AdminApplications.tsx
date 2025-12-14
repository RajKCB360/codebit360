import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Clock, Mail, Phone, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  year: string | null;
  skills: string | null;
  resume_url: string | null;
  status: string | null;
  admin_notes: string | null;
  applied_at: string | null;
  internships: {
    title: string;
  } | null;
}

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('internship_applications')
      .select(`
        *,
        internships (title)
      `)
      .order('applied_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch applications', variant: 'destructive' });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('internship_applications')
      .update({ 
        status, 
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update application', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Application ${status}` });
      fetchApplications();
      setDialogOpen(false);
      setSelectedApp(null);
      setAdminNotes('');
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
    }
  };

  const openDetails = (app: Application) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || '');
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Internship Applications</h2>
        <p className="text-muted-foreground">Review and manage student applications</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.full_name}</p>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{app.internships?.title || 'N/A'}</TableCell>
                  <TableCell>{app.college || 'N/A'}</TableCell>
                  <TableCell>
                    {app.applied_at
                      ? new Date(app.applied_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetails(app)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {applications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No applications yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedApp.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Internship</Label>
                  <p className="font-medium">{selectedApp.internships?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApp.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApp.college || 'N/A'}</span>
                </div>
                <div>
                  <Label className="text-muted-foreground">Year</Label>
                  <p>{selectedApp.year || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <p>{selectedApp.skills || 'Not specified'}</p>
              </div>

              {selectedApp.resume_url && (
                <div>
                  <Label className="text-muted-foreground">Resume</Label>
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block"
                  >
                    View Resume
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10"
                  onClick={() => updateStatus(selectedApp.id, 'approved')}
                  disabled={selectedApp.status === 'approved'}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => updateStatus(selectedApp.id, 'rejected')}
                  disabled={selectedApp.status === 'rejected'}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;

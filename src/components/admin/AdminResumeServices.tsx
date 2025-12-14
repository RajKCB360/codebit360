import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

interface ResumeService {
  id: string;
  user_id: string;
  service_type: string;
  resume_url: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  status: string | null;
  admin_feedback: string | null;
  feedback_file_url: string | null;
  requested_at: string | null;
  user_profile?: {
    email: string | null;
    full_name: string | null;
  } | null;
}

const AdminResumeServices = () => {
  const [requests, setRequests] = useState<ResumeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ResumeService | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: servicesData, error } = await supabase
      .from('resume_services')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch requests', variant: 'destructive' });
    } else if (servicesData) {
      // Fetch profiles for each unique user_id
      const userIds = [...new Set(servicesData.map(s => s.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const data = servicesData.map(service => ({
        ...service,
        user_profile: profilesMap.get(service.user_id) || null
      }));
      setRequests(data);
    }
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!selectedRequest) return;

    const { error } = await supabase
      .from('resume_services')
      .update({ 
        status, 
        admin_feedback: adminFeedback,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Request marked as ${status}` });
      fetchRequests();
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminFeedback('');
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
    }
  };

  const getServiceLabel = (type: string) => {
    const labels: Record<string, string> = {
      'resume_review': 'Resume Review',
      'resume_rewrite': 'Resume Rewrite',
      'linkedin_optimization': 'LinkedIn Optimization',
      'mock_interview': 'Mock Interview',
    };
    return labels[type] || type;
  };

  const openDetails = (request: ResumeService) => {
    setSelectedRequest(request);
    setAdminFeedback(request.admin_feedback || '');
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resume Service Requests</h2>
        <p className="text-muted-foreground">Manage and respond to career service requests</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                <TableCell>
                    <div>
                      <p className="font-medium">{request.user_profile?.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{request.user_profile?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getServiceLabel(request.service_type)}</TableCell>
                  <TableCell>₹{request.payment_amount || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      className={request.payment_status === 'paid' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'}
                    >
                      {request.payment_status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.requested_at
                      ? new Date(request.requested_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetails(request)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {requests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No resume service requests yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedRequest.user_profile?.full_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.user_profile?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="font-medium">{getServiceLabel(selectedRequest.service_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">₹{selectedRequest.payment_amount || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <Badge 
                    className={selectedRequest.payment_status === 'paid' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-yellow-500/10 text-yellow-500'}
                  >
                    {selectedRequest.payment_status || 'Pending'}
                  </Badge>
                </div>
              </div>

              {selectedRequest.resume_url && (
                <div>
                  <Label className="text-muted-foreground">Uploaded Resume</Label>
                  <a
                    href={selectedRequest.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <Label>Feedback to User</Label>
                <Textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  placeholder="Provide feedback for this request..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => updateStatus('in_progress')}
                  disabled={selectedRequest.status === 'in_progress'}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => updateStatus('completed')}
                  disabled={selectedRequest.status === 'completed'}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResumeServices;

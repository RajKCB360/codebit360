import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Users, FileText, TrendingUp, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalCourses: number;
  totalInternships: number;
  totalApplications: number;
  pendingApplications: number;
  totalResumeRequests: number;
  pendingResumeRequests: number;
  totalEnrollments: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalResumeRequests: 0,
    pendingResumeRequests: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [courses, internships, applications, resumeServices, enrollments] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('internships').select('id', { count: 'exact' }),
        supabase.from('internship_applications').select('id, status', { count: 'exact' }),
        supabase.from('resume_services').select('id, status', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' }),
      ]);

      const pendingApps = applications.data?.filter(a => a.status === 'pending').length || 0;
      const pendingResume = resumeServices.data?.filter(r => r.status === 'pending').length || 0;

      setStats({
        totalCourses: courses.count || 0,
        totalInternships: internships.count || 0,
        totalApplications: applications.count || 0,
        pendingApplications: pendingApps,
        totalResumeRequests: resumeServices.count || 0,
        pendingResumeRequests: pendingResume,
        totalEnrollments: enrollments.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Internships',
      value: stats.totalInternships,
      icon: Briefcase,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      subtitle: `${stats.pendingApplications} pending`,
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Resume Requests',
      value: stats.totalResumeRequests,
      subtitle: `${stats.pendingResumeRequests} pending`,
      icon: FileText,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Quick stats about your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;

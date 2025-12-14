-- Create jobs table for curated job listings
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'Full-time',
    experience_level TEXT NOT NULL DEFAULT 'Fresher',
    skills TEXT[] NOT NULL DEFAULT '{}',
    responsibilities TEXT,
    eligibility TEXT,
    apply_url TEXT NOT NULL,
    source TEXT DEFAULT 'Company Website',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Public can view active jobs
CREATE POLICY "Anyone can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true);

-- Admins can manage all jobs
CREATE POLICY "Admins can manage jobs"
ON public.jobs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample jobs
INSERT INTO public.jobs (job_title, company_name, location, job_type, experience_level, skills, responsibilities, eligibility, apply_url, source) VALUES
('Software Developer Intern', 'TCS', 'Mumbai, India', 'Internship', 'Fresher', ARRAY['Java', 'Python', 'SQL'], 'Develop and maintain software applications. Collaborate with senior developers. Write clean, testable code.', 'B.Tech/BE in CS/IT, 2024-2025 batch', 'https://careers.tcs.com', 'Company Website'),
('Associate Software Engineer', 'Infosys', 'Bangalore, India', 'Full-time', '0-1 Years', ARRAY['JavaScript', 'React', 'Node.js'], 'Build web applications. Participate in code reviews. Work in agile teams.', 'B.Tech/MCA, 60% aggregate', 'https://careers.infosys.com', 'Company Website'),
('Python Developer', 'Wipro', 'Hyderabad, India', 'Full-time', 'Fresher', ARRAY['Python', 'Django', 'PostgreSQL'], 'Develop backend APIs. Optimize database queries. Write unit tests.', 'BE/B.Tech/MCA in Computer Science', 'https://careers.wipro.com', 'Company Website'),
('Data Analyst Intern', 'Amazon', 'Remote', 'Internship', 'Fresher', ARRAY['SQL', 'Excel', 'Python', 'Tableau'], 'Analyze business data. Create dashboards. Present insights to stakeholders.', 'Final year students, Statistics/CS background', 'https://amazon.jobs', 'LinkedIn'),
('Cloud Engineer Trainee', 'Google', 'Gurgaon, India', 'Full-time', '0-2 Years', ARRAY['AWS', 'GCP', 'Docker', 'Kubernetes'], 'Deploy cloud infrastructure. Monitor systems. Implement DevOps practices.', 'B.Tech in CS/IT, Cloud certifications preferred', 'https://careers.google.com', 'Company Website');
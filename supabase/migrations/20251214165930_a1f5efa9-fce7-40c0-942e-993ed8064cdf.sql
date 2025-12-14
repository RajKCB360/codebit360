-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    college TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT DEFAULT 'Beginner',
    duration TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    image_url TEXT,
    syllabus JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create internships table
CREATE TABLE public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    tasks JSONB,
    skills TEXT[],
    has_certificate BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Create internship applications table
CREATE TABLE public.internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college TEXT,
    year TEXT,
    skills TEXT,
    resume_url TEXT,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, internship_id)
);

-- Create resume services table
CREATE TABLE public.resume_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    resume_url TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    admin_feedback TEXT,
    feedback_file_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_services ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- RLS Policies for courses (public read, admin write)
CREATE POLICY "Anyone can view active courses"
ON public.courses FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for internships (public read, admin write)
CREATE POLICY "Anyone can view active internships"
ON public.internships FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage internships"
ON public.internships FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for enrollments
CREATE POLICY "Users can view their enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can enroll themselves"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for internship_applications
CREATE POLICY "Users can view their applications"
ON public.internship_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can submit applications"
ON public.internship_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all applications"
ON public.internship_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.internship_applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for resume_services
CREATE POLICY "Users can view their service requests"
ON public.resume_services FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can submit service requests"
ON public.resume_services FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all service requests"
ON public.resume_services FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service requests"
ON public.resume_services FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample courses
INSERT INTO public.courses (title, description, level, duration, price, is_free) VALUES
('Python for Developers', 'Master Python programming from basics to advanced concepts', 'Beginner', '8 weeks', 0, true),
('Full Stack Web Development', 'Build complete web applications with React and Node.js', 'Intermediate', '12 weeks', 4999, false),
('SQL & Database Fundamentals', 'Learn database design and SQL queries', 'Beginner', '6 weeks', 0, true),
('Cloud Computing Basics', 'Introduction to AWS, Azure and GCP', 'Beginner', '8 weeks', 2999, false),
('DevOps Fundamentals', 'CI/CD, Docker, Kubernetes essentials', 'Intermediate', '10 weeks', 3999, false),
('Data Science with Python', 'Analytics, ML basics with real projects', 'Intermediate', '10 weeks', 4999, false);

-- Insert sample internships
INSERT INTO public.internships (title, description, duration, tasks, skills, has_certificate, is_paid, price) VALUES
('Software Developer Intern', 'Build real-world applications and gain industry experience', '8 weeks', '["Complete coding assignments", "Build a capstone project", "Code reviews", "Weekly mentorship"]', ARRAY['Python', 'JavaScript', 'Git'], true, false, 0),
('Python Developer Intern', 'Focus on Python backend development and automation', '6 weeks', '["Python scripting tasks", "API development", "Database integration", "Final project"]', ARRAY['Python', 'Django', 'PostgreSQL'], true, false, 0),
('Web Developer Intern', 'Frontend and full-stack web development experience', '8 weeks', '["Build responsive UIs", "React components", "Backend integration", "Deploy project"]', ARRAY['HTML', 'CSS', 'React', 'Node.js'], true, false, 0),
('Cloud/DevOps Intern', 'Learn cloud infrastructure and DevOps practices', '6 weeks', '["Setup cloud resources", "CI/CD pipelines", "Container deployment", "Infrastructure project"]', ARRAY['AWS', 'Docker', 'Kubernetes'], true, true, 999),
('Data Analyst Intern', 'Data analysis and visualization projects', '6 weeks', '["Data cleaning", "Statistical analysis", "Dashboard creation", "Analytics report"]', ARRAY['Python', 'SQL', 'Power BI'], true, false, 0);
-- Create job analytics table
CREATE TABLE public.job_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'save', 'apply_click')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_job_analytics_job_id ON public.job_analytics(job_id);
CREATE INDEX idx_job_analytics_event_type ON public.job_analytics(event_type);
CREATE INDEX idx_job_analytics_created_at ON public.job_analytics(created_at);

-- Enable RLS
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
ON public.job_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view all analytics"
ON public.job_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create a view for aggregated job stats
CREATE OR REPLACE VIEW public.job_stats AS
SELECT 
  j.id as job_id,
  j.job_title,
  j.company_name,
  COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as view_count,
  COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as save_count,
  COUNT(CASE WHEN ja.event_type = 'apply_click' THEN 1 END) as apply_click_count
FROM public.jobs j
LEFT JOIN public.job_analytics ja ON j.id = ja.job_id
GROUP BY j.id, j.job_title, j.company_name;
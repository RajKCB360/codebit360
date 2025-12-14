-- Create saved_jobs table for bookmarking jobs
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their saved jobs
CREATE POLICY "Users can view their saved jobs"
ON public.saved_jobs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can save jobs
CREATE POLICY "Users can save jobs"
ON public.saved_jobs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can unsave jobs
CREATE POLICY "Users can unsave jobs"
ON public.saved_jobs FOR DELETE
TO authenticated
USING (user_id = auth.uid());
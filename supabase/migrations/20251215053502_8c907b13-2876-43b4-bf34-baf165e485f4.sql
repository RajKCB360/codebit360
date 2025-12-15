-- Create roadmaps table for storing roadmap metadata (no file storage)
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'Beginner',
  drive_link TEXT NOT NULL,
  preview_url TEXT,
  download_url TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active roadmaps
CREATE POLICY "Anyone can view active roadmaps"
ON public.roadmaps
FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage all roadmaps
CREATE POLICY "Admins can manage roadmaps"
ON public.roadmaps
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to auto-generate preview/download URLs from drive link
CREATE OR REPLACE FUNCTION public.process_drive_link()
RETURNS TRIGGER AS $$
DECLARE
  file_id TEXT;
BEGIN
  -- Extract file ID from Google Drive link
  IF NEW.drive_link ~ 'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)' THEN
    file_id := substring(NEW.drive_link from 'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)');
    NEW.preview_url := 'https://drive.google.com/file/d/' || file_id || '/preview';
    NEW.download_url := 'https://drive.google.com/uc?export=download&id=' || file_id;
  ELSE
    -- If not a standard drive link, use as-is
    NEW.preview_url := NEW.drive_link;
    NEW.download_url := NEW.drive_link;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-process drive links
CREATE TRIGGER process_roadmap_drive_link
BEFORE INSERT OR UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION public.process_drive_link();
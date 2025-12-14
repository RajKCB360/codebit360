-- Add new columns to jobs table for AI generation
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS original_text TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Update existing jobs to have published status
UPDATE jobs SET status = 'published' WHERE status IS NULL;
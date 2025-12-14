-- Drop the security definer view and recreate as a regular view
DROP VIEW IF EXISTS public.job_stats;

-- Recreate as invoker view (default, secure)
CREATE VIEW public.job_stats 
WITH (security_invoker = true)
AS
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
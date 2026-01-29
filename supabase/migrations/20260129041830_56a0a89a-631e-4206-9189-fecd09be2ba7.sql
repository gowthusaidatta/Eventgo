-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- RLS policies for media bucket
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

-- Add media columns to opportunities table
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add video column to events table (already has banner_url for image)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS video_url TEXT;
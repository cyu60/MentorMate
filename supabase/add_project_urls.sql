-- Add project_url and additional_materials_url columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_url TEXT,
ADD COLUMN IF NOT EXISTS additional_materials_url TEXT;

-- Create storage bucket for project materials if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-materials', 'project-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-materials'
  AND auth.role() = 'authenticated'
);

-- Set up storage policy to allow public access to read files
CREATE POLICY "Allow public to read files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'project-materials');
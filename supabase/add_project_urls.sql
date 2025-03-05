ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_url TEXT,
ADD COLUMN IF NOT EXISTS additional_materials_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-materials', 'project-materials', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-materials'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public to read files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'project-materials');
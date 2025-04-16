-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to create their own projects" ON projects;
DROP POLICY IF EXISTS "Allow users to read their own projects" ON projects;
DROP POLICY IF EXISTS "Allow users to update their own projects" ON projects;

-- Allow users to create their own projects
CREATE POLICY "Allow users to create their own projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt()->>'email' = lead_email
);

-- Allow users to read their own projects
CREATE POLICY "Allow users to read their own projects"
ON projects FOR SELECT
TO authenticated
USING (
  auth.jwt()->>'email' = lead_email
  OR auth.jwt()->>'email' = ANY(teammates)
);

-- Allow users to update their own projects
CREATE POLICY "Allow users to update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (
  auth.jwt()->>'email' = lead_email
)
WITH CHECK (
  auth.jwt()->>'email' = lead_email
);

-- Allow users to create project track relationships for their own projects
DROP POLICY IF EXISTS "Allow users to create track relationships for their projects" ON project_tracks;

CREATE POLICY "Allow users to create track relationships for their projects"
ON project_tracks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_tracks.project_id
    AND lead_email = auth.jwt()->>'email'
  )
); 
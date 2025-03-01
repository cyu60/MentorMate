CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  project_description TEXT NOT NULL,
  teammates JSONB DEFAULT '[]'::jsonb,
  event_id UUID NOT NULL REFERENCES events(event_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.email() = lead_email);

CREATE POLICY "Project leads can update their projects" ON projects
  FOR UPDATE
  USING (auth.email() = lead_email)
  WITH CHECK (auth.email() = lead_email);

CREATE POLICY "Project leads can delete their projects" ON projects
  FOR DELETE
  USING (auth.email() = lead_email);

CREATE INDEX projects_lead_email_idx ON projects(lead_email);
CREATE INDEX projects_event_id_idx ON projects(event_id);
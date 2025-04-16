-- Enable RLS on event_tracks table
ALTER TABLE event_tracks ENABLE ROW LEVEL SECURITY;

-- Allow read access to event_tracks for all authenticated users
CREATE POLICY "Allow read access to event_tracks for all authenticated users"
ON event_tracks FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on project_scores table
ALTER TABLE project_scores ENABLE ROW LEVEL SECURITY;

-- Allow judges to read all scores for their assigned events
CREATE POLICY "Allow judges to read all scores for their events"
ON project_scores FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = (
      SELECT event_id FROM projects WHERE id = project_scores.project_id
    )
    AND user_event_roles.role IN ('judge', 'admin')
  )
);

-- Allow judges to create/update their own scores
CREATE POLICY "Allow judges to create their own scores"
ON project_scores FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = judge_id
  AND EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = (
      SELECT event_id FROM projects WHERE id = project_scores.project_id
    )
    AND user_event_roles.role IN ('judge', 'admin')
  )
);

CREATE POLICY "Allow judges to update their own scores"
ON project_scores FOR UPDATE
TO authenticated
USING (
  auth.uid() = judge_id
  AND EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = (
      SELECT event_id FROM projects WHERE id = project_scores.project_id
    )
    AND user_event_roles.role IN ('judge', 'admin')
  )
)
WITH CHECK (
  auth.uid() = judge_id
  AND EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = (
      SELECT event_id FROM projects WHERE id = project_scores.project_id
    )
    AND user_event_roles.role IN ('judge', 'admin')
  )
);

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow judges to read all projects for their assigned events
CREATE POLICY "Allow judges to read projects for their events"
ON projects FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = projects.event_id
    AND user_event_roles.role IN ('judge', 'admin')
  )
);

-- Enable RLS on project_tracks table
ALTER TABLE project_tracks ENABLE ROW LEVEL SECURITY;

-- Allow judges to read all project_tracks for their assigned events
CREATE POLICY "Allow judges to read project_tracks for their events"
ON project_tracks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = (
      SELECT event_id FROM projects WHERE id = project_tracks.project_id
    )
    AND user_event_roles.role IN ('judge', 'admin')
  )
); 
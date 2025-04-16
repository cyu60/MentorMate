-- Add event_id column to project_scores
ALTER TABLE project_scores 
ADD COLUMN event_id UUID REFERENCES events(event_id);

-- Backfill event_id from projects table
UPDATE project_scores
SET event_id = projects.event_id
FROM projects
WHERE project_scores.project_id = projects.id;

-- Make event_id NOT NULL after backfill
ALTER TABLE project_scores 
ALTER COLUMN event_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_project_scores_event_id ON project_scores(event_id);

-- Update RLS policies for project_scores to use direct event_id
DROP POLICY IF EXISTS "Allow judges to read all scores for their events" ON project_scores;
DROP POLICY IF EXISTS "Allow judges to create their own scores" ON project_scores;
DROP POLICY IF EXISTS "Allow judges to update their own scores" ON project_scores;

-- Simplified RLS policies using direct event_id
CREATE POLICY "Allow judges to read all scores for their events"
ON project_scores FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = project_scores.event_id
    AND user_event_roles.role IN ('judge', 'admin')
  )
);

CREATE POLICY "Allow judges to create their own scores"
ON project_scores FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = judge_id
  AND EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = project_scores.event_id
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
    AND user_event_roles.event_id = project_scores.event_id
    AND user_event_roles.role IN ('judge', 'admin')
  )
)
WITH CHECK (
  auth.uid() = judge_id
  AND EXISTS (
    SELECT 1 FROM user_event_roles
    WHERE user_event_roles.user_id = auth.uid()
    AND user_event_roles.event_id = project_scores.event_id
    AND user_event_roles.role IN ('judge', 'admin')
  )
); 
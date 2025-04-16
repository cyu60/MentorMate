-- Add event_id and track_id columns
ALTER TABLE project_scores 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(event_id),
ADD COLUMN IF NOT EXISTS track_id UUID REFERENCES event_tracks(track_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_scores_event_id ON project_scores(event_id);
CREATE INDEX IF NOT EXISTS idx_project_scores_track_id ON project_scores(track_id);

-- Update RLS policies
ALTER TABLE project_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow judges to read all scores for their events" ON project_scores;
DROP POLICY IF EXISTS "Allow judges to create their own scores" ON project_scores;
DROP POLICY IF EXISTS "Allow judges to update their own scores" ON project_scores;

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
); 
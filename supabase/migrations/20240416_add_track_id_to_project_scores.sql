-- First add the column as nullable
ALTER TABLE project_scores
ADD COLUMN track_id TEXT;

-- Update existing records to use a default track from their project's track_ids
UPDATE project_scores ps
SET track_id = 'coding_challenge_1'
WHERE ps.track_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE project_scores
ALTER COLUMN track_id SET NOT NULL;

-- Add composite unique constraint to ensure one score per project per track per judge
ALTER TABLE project_scores
DROP CONSTRAINT IF EXISTS project_scores_project_id_judge_id_key;

ALTER TABLE project_scores
ADD CONSTRAINT project_scores_project_id_judge_id_track_id_key 
UNIQUE (project_id, judge_id, track_id);

-- Add constraint to ensure track_id exists in project's track_ids
CREATE OR REPLACE FUNCTION validate_score_track_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the track_id exists in the project's track_ids array
  IF NOT EXISTS (
    SELECT 1
    FROM projects
    WHERE id = NEW.project_id
    AND NEW.track_id = ANY(track_ids)
  ) THEN
    RAISE EXCEPTION 'Invalid track_id: Project does not belong to this track';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_score_track_id
BEFORE INSERT OR UPDATE ON project_scores
FOR EACH ROW
EXECUTE FUNCTION validate_score_track_id(); 
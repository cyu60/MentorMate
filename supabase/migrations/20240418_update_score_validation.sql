-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS validate_score_track_id ON project_scores;
DROP FUNCTION IF EXISTS validate_score_track_id();

-- Create the updated function to use project_tracks junction table
CREATE OR REPLACE FUNCTION validate_score_track_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the track_id exists in the project's tracks using the junction table
  IF NOT EXISTS (
    SELECT 1
    FROM project_tracks
    WHERE project_id = NEW.project_id
    AND track_id = NEW.track_id
  ) THEN
    RAISE EXCEPTION 'Invalid track_id: Project does not belong to this track';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER validate_score_track_id
BEFORE INSERT OR UPDATE ON project_scores
FOR EACH ROW
EXECUTE FUNCTION validate_score_track_id(); 
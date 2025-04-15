-- Add track_ids column to projects table (using array type)
ALTER TABLE projects
ADD COLUMN track_ids TEXT[];

-- Create GIN index for efficient array operations
CREATE INDEX idx_projects_track_ids ON projects USING GIN (track_ids);

-- Add constraint to ensure all track_ids exist in event's scoring config
CREATE OR REPLACE FUNCTION validate_track_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if any of the track_ids are not in the event's scoring config
  IF EXISTS (
    SELECT 1
    FROM unnest(NEW.track_ids) AS track_id
    WHERE track_id NOT IN (
      SELECT DISTINCT jsonb_object_keys(events.scoring_config->'tracks')
      FROM events
      WHERE event_id = NEW.event_id
    )
  ) THEN
    RAISE EXCEPTION 'Invalid track ID found in track_ids';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_project_track_ids
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
WHEN (NEW.track_ids IS NOT NULL)
EXECUTE FUNCTION validate_track_ids(); 
-- Add role_labels column to events table
ALTER TABLE events
ADD COLUMN role_labels JSONB;

-- Create index for efficient querying of role labels
CREATE INDEX idx_events_role_labels ON events USING gin (role_labels);

-- Add comment to explain the structure
COMMENT ON COLUMN events.role_labels IS 'JSON object containing custom labels for each role. Example:
{
  "participant": "Founder",
  "mentor": "Observer",
  "judge": "Investor",
  "organizer": "Organizer"
}';

-- Set default values for all existing events
UPDATE events
SET role_labels = '{
  "participant": "Participant",
  "mentor": "Mentor", 
  "judge": "Judge",
  "organizer": "Organizer"
}'::jsonb; 
-- Add scoring_config column to events table
ALTER TABLE events
ADD COLUMN scoring_config JSONB;

-- Create index for efficient querying of scoring config
CREATE INDEX idx_events_scoring_config ON events USING gin (scoring_config);

-- Add comment to explain the structure
COMMENT ON COLUMN events.scoring_config IS 'JSON object containing scoring criteria configuration. Example:
{
  "criteria": [
    {
      "id": "technical",
      "name": "Technical Implementation",
      "description": "Quality of code and implementation",
      "weight": 1,
      "min": 1,
      "max": 10
    }
  ],
  "defaultMin": 1,
  "defaultMax": 10,
  "defaultWeight": 1
}'; 
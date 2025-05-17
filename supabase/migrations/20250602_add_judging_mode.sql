-- Create judging_mode enum type
CREATE TYPE judging_mode AS ENUM ('traditional', 'investment');

-- Add judging_mode column to event_tracks table
ALTER TABLE event_tracks
ADD COLUMN judging_mode judging_mode DEFAULT 'traditional';

-- Add comment to explain the values
COMMENT ON COLUMN event_tracks.judging_mode IS 'Judging interface mode (enum): "traditional" or "investment". Additional modes can be added by altering the enum type.';

-- Set default values for all existing tracks
UPDATE event_tracks
SET judging_mode = 'traditional'; 
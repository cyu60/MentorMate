-- Add status column to platform_engagement table
ALTER TABLE platform_engagement ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress';

UPDATE platform_engagement SET status = 'in_progress' WHERE type = 'goal' AND status IS NULL;
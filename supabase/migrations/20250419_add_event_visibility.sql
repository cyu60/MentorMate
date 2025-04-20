-- Create enum type for event visibility
CREATE TYPE event_visibility AS ENUM ('test', 'demo', 'private', 'public', 'draft');

-- Add visibility column to events table
ALTER TABLE public.events
ADD COLUMN visibility event_visibility NOT NULL DEFAULT 'draft';
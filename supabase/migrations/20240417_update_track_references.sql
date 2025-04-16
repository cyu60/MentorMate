-- First, let's ensure we have matching tracks in event_tracks table
-- Create temporary table to store track mappings
CREATE TEMPORARY TABLE track_name_to_id (
    track_name text PRIMARY KEY,
    track_id uuid DEFAULT gen_random_uuid()
);

-- Insert unique track names from existing projects
INSERT INTO track_name_to_id (track_name)
SELECT DISTINCT unnest(track_ids) as track_name
FROM projects
WHERE track_ids IS NOT NULL;

-- Insert tracks into event_tracks with conflict handling
INSERT INTO event_tracks (track_id, event_id, name, description, prize_amount, prize_description)
SELECT DISTINCT ON (t.track_name)
    t.track_id,
    p.event_id,
    t.track_name,
    'Migrated track',
    'TBD',
    'Track migrated from previous system'
FROM track_name_to_id t
CROSS JOIN (SELECT DISTINCT event_id FROM projects) p
ON CONFLICT (track_id) DO NOTHING;

-- Update our mapping table with actual track IDs from event_tracks
UPDATE track_name_to_id t
SET track_id = e.track_id
FROM event_tracks e
WHERE e.name = t.track_name;

-- Create junction table for projects and tracks
CREATE TABLE IF NOT EXISTS project_tracks (
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    track_id uuid REFERENCES event_tracks(track_id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (project_id, track_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_tracks_track_id ON project_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_project_tracks_project_id ON project_tracks(project_id);

-- Migrate existing track_ids data to junction table using the mapping
WITH unnested_tracks AS (
    SELECT 
        p.id as project_id,
        unnest(p.track_ids) as track_name
    FROM projects p
    WHERE p.track_ids IS NOT NULL
)
INSERT INTO project_tracks (project_id, track_id)
SELECT DISTINCT ut.project_id, m.track_id
FROM unnested_tracks ut
INNER JOIN track_name_to_id m ON m.track_name = ut.track_name
ON CONFLICT (project_id, track_id) DO NOTHING;

-- Update project_scores to use proper foreign key
-- First, create a temporary column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'project_scores' 
        AND column_name = 'track_id_new'
    ) THEN
        ALTER TABLE project_scores ADD COLUMN track_id_new uuid;
    END IF;
END $$;

-- Update the new column using the mapping
UPDATE project_scores ps
SET track_id_new = m.track_id
FROM track_name_to_id m
WHERE ps.track_id = m.track_name;

-- Drop the old column and rename the new one (as separate operations)
ALTER TABLE project_scores DROP COLUMN IF EXISTS track_id CASCADE;
ALTER TABLE project_scores RENAME COLUMN track_id_new TO track_id;

-- Add the foreign key constraint
ALTER TABLE project_scores 
    ADD CONSTRAINT fk_project_scores_track 
    FOREIGN KEY (track_id) 
    REFERENCES event_tracks(track_id) 
    ON DELETE CASCADE;

-- Drop the trigger before dropping the column
DROP TRIGGER IF EXISTS validate_project_track_ids ON projects;
DROP FUNCTION IF EXISTS validate_project_track_ids() CASCADE;

-- Drop the old track_ids column from projects if it exists
ALTER TABLE projects DROP COLUMN IF EXISTS track_ids;

-- Add RLS policies for project_tracks
ALTER TABLE project_tracks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON project_tracks;
DROP POLICY IF EXISTS "Allow full access for project owners and teammates" ON project_tracks;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all authenticated users" 
ON project_tracks FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert/update/delete for project owners and teammates
CREATE POLICY "Allow full access for project owners and teammates" 
ON project_tracks FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_tracks.project_id 
        AND (
            p.lead_email = auth.jwt()->>'email' 
            OR p.teammates @> ARRAY[auth.jwt()->>'email']
        )
    )
); 
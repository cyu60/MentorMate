CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL,
    prize_amount TEXT NOT NULL,
    prize_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES event_track(track_id) ON DELETE CASCADE
);

-- Create an index on track_id for faster lookups
CREATE INDEX idx_prizes_track_id ON prizes(track_id);
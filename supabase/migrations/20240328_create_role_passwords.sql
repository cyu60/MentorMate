-- Create role_passwords table
CREATE TABLE role_passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, role)
);

-- Create index for faster lookups
CREATE INDEX idx_role_passwords_event_role ON role_passwords(event_id, role); 
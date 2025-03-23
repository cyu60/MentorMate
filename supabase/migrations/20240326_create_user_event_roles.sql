-- Create enum for event roles
CREATE TYPE event_role AS ENUM ('participant', 'mentor', 'judge', 'organizer', 'admin');

-- Create user_event_roles table
CREATE TABLE user_event_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    role event_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Create indexes
CREATE INDEX idx_user_event_roles_user_id ON user_event_roles(user_id);
CREATE INDEX idx_user_event_roles_event_id ON user_event_roles(event_id);
CREATE INDEX idx_user_event_roles_role ON user_event_roles(role);
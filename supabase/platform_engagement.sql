CREATE TABLE IF NOT EXISTS platform_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES events(event_id),
  type TEXT NOT NULL CHECK (type IN ('goal', 'journal')),
  content TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE platform_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries and entries for events they're part of"
  ON platform_engagement
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.event_id = platform_engagement.event_id
      AND projects.lead_email = auth.email()
    )
  );

CREATE POLICY "Users can insert their own entries"
  ON platform_engagement
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON platform_engagement
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON platform_engagement
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX platform_engagement_user_id_idx ON platform_engagement(user_id);
CREATE INDEX platform_engagement_event_id_idx ON platform_engagement(event_id);
CREATE INDEX platform_engagement_type_idx ON platform_engagement(type);
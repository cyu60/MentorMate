SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth';

SELECT id, raw_user_meta_data->>'full_name' AS full_name, email
FROM auth.users

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Create a secure view for accessing user profile information
CREATE OR REPLACE VIEW user_profiles_view AS
SELECT 
    au.id,
    au.email,
    COALESCE(
        (au.raw_user_meta_data->>'full_name')::text,
        split_part(au.email, '@', 1)
    ) as display_name
FROM auth.users au;

-- Grant access to the view
GRANT SELECT ON user_profiles_view TO authenticated;

-- Add RLS policy
ALTER VIEW user_profiles_view ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible to all authenticated users" 
    ON user_profiles_view
    FOR SELECT 
    TO authenticated 
    USING (true);
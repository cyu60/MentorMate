-- Add social_links column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN social_links JSONB DEFAULT '{
  "linkedin": null,
  "github": null,
  "twitter": null,
  "portfolio": null
}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.social_links IS 'JSON object containing user social media and professional links'; 
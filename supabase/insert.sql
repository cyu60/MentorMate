CREATE OR REPLACE FUNCTION insert()
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (display_name, email, uid)
  SELECT raw_user_meta_data->>'full_name', email, id
  FROM auth.users
  WHERE raw_user_meta_data->>'full_name' IS NOT NULL
  ON CONFLICT (email) DO UPDATE
  SET 
      display_name = EXCLUDED.display_name,
      email=EXCLUDED.email;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION insert() TO anon, authenticated;

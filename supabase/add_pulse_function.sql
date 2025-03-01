-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_pulse;

-- Create the function with explicit parameter name
CREATE OR REPLACE FUNCTION increment_pulse("userId" uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET pulse = COALESCE(pulse, 0) + 1 
  WHERE id = "userId";
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_pulse(uuid) TO authenticated;
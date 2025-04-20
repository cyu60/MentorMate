CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
    admin_ids UUID[] := ARRAY[
        '5fd21fad-2ea4-4caa-aab1-596ab7f6a4d7'::UUID, -- spencer
        'ec64dc8e-fc2b-45a8-9fd8-4a32e2d63f2c'::UUID, -- quest 2 learn
        'c0bb8ce8-a8cf-4db0-82d3-262535825d12'::UUID, -- Hello mentor mates
        'e4182548-e05d-4201-bc61-fe5d76a7a7ce'::UUID, -- Matthew dev
        'a91610aa-5324-4978-b75d-2994ba3e15fd'::UUID  -- Chinat dev
    ];
BEGIN
    RETURN user_id = ANY(admin_ids);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Usage examples:
-- SELECT is_admin_user('5fd21fad-2ea4-4caa-aab1-596ab7f6a4d7'::UUID); -- Returns true
-- SELECT is_admin_user('00000000-0000-0000-0000-000000000000'::UUID); -- Returns false

-- You can also use this in WHERE clauses:
-- SELECT * FROM users WHERE is_admin_user(user_id); 
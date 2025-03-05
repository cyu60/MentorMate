CREATE OR REPLACE FUNCTION sync_auth_users_to_profiles()
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_profiles (email, display_name)
    SELECT 
        au.email,
        COALESCE(
            au.raw_user_meta_data->>'full_name',  
            split_part(au.email, '@', 1)          
        ) as display_name
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.email = up.email
    WHERE up.email IS NULL;

    UPDATE public.user_profiles up
    SET 
        display_name = COALESCE(
            au.raw_user_meta_data->>'full_name',  
            split_part(au.email, '@', 1)          
        )
    FROM auth.users au
    WHERE up.email = au.email
    AND up.display_name != COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT sync_auth_users_to_profiles();

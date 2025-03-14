import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    );
    return supabase;
};

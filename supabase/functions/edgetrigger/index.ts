


import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;





const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { error } = await supabase.rpc('insert');
    
    if (error) {
      console.error('Error syncing profiles:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }


    return new Response(
      JSON.stringify({ message: 'Profiles synced successfully' }),
      { status: 200 }
    );
  } catch (err) {

    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/edgetrigger' \
    --header 'Authorization: Bearer SUPABASE_PUBLIC_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

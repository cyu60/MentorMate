import { NextResponse } from 'next/server';
import { createSupabaseClient } from '../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const referer = request.headers.get('referer') || '';
  
  // Use environment variable for base URL, fallback to request origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    console.error("Error exchanging code for session:", error);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error("Error getting user:", userError);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const user = userData.user;
  const isMentorLogin = referer.includes('/mentor');
  
  if (isMentorLogin) {
    const { data: existingMentor, error: mentorCheckError } = await supabase
      .from('mentors')
      .select('id')
      .eq('id', user.id)
      .single();

    if (mentorCheckError && mentorCheckError.code !== 'PGRST116') {
      console.error("Error checking mentor:", mentorCheckError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    if (!existingMentor) {
      if (!user.email) {
        console.error("No email found for user:", user.id);
        return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=missing_email`);
      }

      const { error: mentorError } = await supabase
        .from('mentors')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          updated_at: new Date().toISOString()
        });

      if (mentorError) {
        console.error("Error creating mentor:", mentorError);
        return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
      }
    }

    return NextResponse.redirect(`${baseUrl}/mentor`);
  } else {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.email?.split('@')[0],
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error("Error upserting user profile:", profileError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    return NextResponse.redirect(`${baseUrl}/participant`);
  }
}

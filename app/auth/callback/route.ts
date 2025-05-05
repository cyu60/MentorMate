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

  console.log("Starting auth callback with code");
  console.log("Starting auth callback with code");
  const supabase = await createSupabaseClient();
  
  // First, get the current session

  // We may need to use getUser instead of getSession for routes 
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("ROOT: Error getting session:", sessionError);
  }
  console.log("ROOT: Current session data:", JSON.stringify(sessionData, null, 2));

  // Then exchange code for session
  const { data: { session }, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
  
  if (codeError) {
    console.error("Error exchanging code for session:", codeError);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  if (!session) {
    console.error("No session found after code exchange");
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Log the session after code exchange
  console.log("ROOT: Session after code exchange:", JSON.stringify(session, null, 2));
    
    const user = session.user;
    if (!user?.email) {
      console.error("No email found in session user data");
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    // Create user profile immediately after session exchange
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        uid: user.id,
        display_name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating user profile:", profileError);
          }

  // First, try to create user profile regardless of mentor status
  if (!user.email) {
    console.error("No email found for user:", user.id);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=missing_email`);
  }

  console.log("Checking session user data:", {
    id: user.id,
    email: user.email,
    metadata: user.user_metadata
  });

  // Try to create user profile first
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('user_profiles')
    .select('uid')
    .eq('uid', user.id)
    .single();

  if (profileCheckError && profileCheckError.code !== 'PGRST116') {
    console.error("Error checking user profile:", profileCheckError);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  if (!existingProfile) {
    const profileData = {
      uid: user.id,
      display_name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email,
      created_at: new Date().toISOString()
    };
    
    console.log("Attempting to create user profile with data:", JSON.stringify(profileData, null, 2));
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.log("Profile creation error:", profileError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }
  }

  // Then handle mentor-specific logic if needed
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
  }

  // Default redirect for non-mentor users
  const returnUrl = searchParams.get('returnUrl');
  const participantRedirectUrl = `${baseUrl}/events${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
  return NextResponse.redirect(participantRedirectUrl);
}

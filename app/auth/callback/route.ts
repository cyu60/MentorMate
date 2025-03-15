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
  const supabase = createSupabaseClient();
  
  console.log("Exchanging code for session...");
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    console.error("Error exchanging code for session:", error);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }
  console.log("Successfully exchanged code for session:", sessionData);

  // Get user from session data
  if (!sessionData?.session?.user) {
    console.error("No user data in session:", sessionData);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const user = sessionData.session.user;
  console.log("Session data:", sessionData);
  console.log("User data:", user);
  console.log("User metadata:", user.user_metadata);
  const isMentorLogin = referer.includes('/mentor');
  
  // Ensure we have required user data
  if (!user.email) {
    console.error("No email found for user:", user.id);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=missing_email`);
  }

  if (isMentorLogin) {
    return NextResponse.redirect(`${baseUrl}/mentor`);
  } else {
    console.log("Creating/updating user profile...");
    
    const profileData = {
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email,
      events: [],
      pulse: 0
    };
    console.log("Profile data:", profileData);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'email'
      })
      .select();

    if (profileError) {
      console.error("Error upserting user profile:", profileError);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
    }

    console.log("Successfully upserted user profile:", profile);

    const returnUrl = searchParams.get('returnUrl');
    const participantRedirectUrl = `${baseUrl}${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
    return NextResponse.redirect(participantRedirectUrl);
  }
}

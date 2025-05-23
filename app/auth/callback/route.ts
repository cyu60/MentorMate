import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Use environment variable for base URL, fallback to request origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  if (!code) {
    return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
  }

  console.log("Starting auth callback with code");
  const supabase = await createSupabaseClient();

  // Exchange code for session
  const {
    data: { session },
    error: codeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (codeError) {
    console.error("Error exchanging code for session:", codeError);
    return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
  }

  if (!session) {
    console.error("No session found after code exchange");
    return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
  }

  // Log the session after code exchange
  console.log(
    "ROOT: Session after code exchange:",
    JSON.stringify(session, null, 2)
  );

  const user = session.user;
  if (!user?.email) {
    console.error("No email found in session user data");
    return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
  }

  // Try to check user profile first
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("user_profiles")
    .select("uid")
    .eq("uid", user.id)
    .single();

  if (profileCheckError && profileCheckError.code !== "PGRST116") {
    console.error("Error checking user profile:", profileCheckError);
    return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
  }

  if (!existingProfile) {
    const profileData = {
      uid: user.id,
      display_name: user.user_metadata?.full_name || user.email.split("@")[0],
      email: user.email,
      created_at: new Date().toISOString(),
    };

    console.log(
      "Attempting to create user profile with data:",
      JSON.stringify(profileData, null, 2)
    );

    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert(profileData);

    if (profileError) {
      console.log("Profile creation error:", profileError);
      return NextResponse.redirect(`${cleanBaseUrl}/auth/auth-code-error`);
    }
  }

  // Default redirect for non-mentor users
  const returnUrl = searchParams.get("returnUrl") || '';
  const cleanReturnUrl = returnUrl.startsWith('/') ? returnUrl.slice(1) : returnUrl;

  const participantRedirectUrl = `${cleanBaseUrl}/${cleanReturnUrl}`;
  console.log("Redirecting to:", participantRedirectUrl);
  return NextResponse.redirect(participantRedirectUrl);
}

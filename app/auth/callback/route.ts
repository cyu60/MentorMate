import { NextResponse } from 'next/server';
import { createSupabaseClient } from '../../utils/supabase/server'; // Relative path

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/'; // Use "next" param if available

  if (code) {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { user } = supabase.auth.user(); // Get the user object
      console.log("User:", user); // Log the user object

      // Insert user email into the users table
      const { data, error: insertError } = await supabase
        .from('users') // Replace with your table name
        .insert([{ id: user.id, email: user.email, created_at: new Date() }]); // Adjust the data structure as needed

      if (insertError) {
        console.error("Error inserting user email:", insertError.message);
      } else {
        console.log("User email inserted successfully:", data);
      }

      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error exchanging code for session:", error.message);
    }
  }

  // Redirect to an error page if the code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  });

  if (error) {
    console.error("Error during sign-in:", error.message);
  } else {
    const { session } = data; // Get the session
    console.log("Session:", session); // Log the session

    // Insert user data into Supabase
    if (session) {
      const insertUserData = async (userId) => {
        const { data, error } = await supabase
          .from('Users') // Replace with your table name
          .insert([{ UID: userId, created_at: new Date() }]); // Adjust the data structure as needed

        if (error) {
          console.error("Error inserting data:", error.message);
        } else {
          console.log("Data inserted successfully:", data);
        }
      };

      insertUserData(session.user.id); // Pass the user ID or any relevant data
    }
  }
};

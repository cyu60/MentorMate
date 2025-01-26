
import { NextResponse } from 'next/server';
import { createSupabaseClient } from '../../utils/supabase/server'; 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/'; 

  if (code) {
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user; 
    if (userError) {
        console.error("Error getting user:", userError.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError) {
          console.error("Error getting user:", userError.message);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }
      console.log("User:", user); 

      if (user) {
        const { data, error: insertError } = await supabase
          .from('Users')
          .insert([{ id: user.id, email: user.email, created_at: new Date() }]);

        // Insert into user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ id: user.id, username: user.user_metadata?.full_name, email: user.email }]);

        if (profileError) {
          console.error("Error inserting user profile:", profileError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${profileError.message}`);
        } else {
          console.log("User profile inserted successfully");
        }
        
        if (insertError) {
          console.error("Error inserting user email:", insertError);
          console.error("Error details:", insertError.details); 
          return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${insertError.message}`);
        } else {
          console.log("User email inserted successfully:", data);
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('insert'); 
        if (rpcError) {
          console.error('Error executing insert function:', rpcError.message);
        } else {
          console.log('RPC function executed successfully:', rpcData);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }


  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

const handleGoogleSignIn = async () => {
  const supabase = createSupabaseClient(); 
  const { data: signInData, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  });
  const { url } = signInData;
  if (url) {
    console.log("Redirect URL:", url);
  }

  if (error) {
    console.error("Error during sign-in:", error.message);
  } else {
    console.log("Sign-in successful");


    if (error) {
  console.error("Error during sign-in:", error.message);
} else {
  console.log("Sign-in successful");

  const insertUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from('Users')
      .insert([{ UID: userId, created_at: new Date() }]);

    if (error) {
      console.error("Error inserting data:", error.message);
    } else {
      console.log("Data inserted successfully:", data);
    }
  };
}

      const { data: signUpData, error: signupError } = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'New User',
          },
        },
      });
      const user = signUpData?.user;
      
      if (user) {
        console.log("User object found:", user);

        if (user) {
          console.log("User data before RPC call:", {
            full_name: user.user_metadata?.full_name,
            email: user.email,
          });
        } else {
          console.log("User object is not defined.");
        }
        console.log("Attempting to sync user data..."); 
        const { data, error } = await supabase.rpc('insert'); 
        if (error) {
          console.error('Error executing insert function:', error.message);
        } else {
          console.log('User synced successfully:', data);
        }
      } else {
        console.log("No user object found."); 
      }
    }
  }
};

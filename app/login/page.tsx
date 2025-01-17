"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (session) {
        router.push('/participant'); 
      }
      setLoading(false); 
    };

    checkSession();
  }, [router]);

  const handleAuthChange = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/participant'); // Redirect after login
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', // Adjust this as needed
      },
    });
  
    if (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'darkblue',
                brandAccent: 'darkblue',
              },
            },
          },
        }}
          providers={['google', 'github']} 
          socialLayout="horizontal"
          onAuthChange={handleAuthChange}
        />
      </div>
    </div>
  );
}
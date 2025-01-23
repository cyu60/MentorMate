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
  const [isSignUp, setIsSignUp] = useState(false);

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
      router.push('/participant');  
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', 
      },
    });
  
    if (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  const handleSignUpClick = () => {
    setIsSignUp(true);
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">{isSignUp ? 'Sign Up' : 'Login'}</h2>
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
          view={isSignUp ? 'sign_up' : 'sign_in'}
        />
        <div className="mt-4 text-center">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              onClick={isSignUp ? () => setIsSignUp(false) : handleSignUpClick}
              className="text-blue-500 hover:underline"
            >
              {isSignUp ? 'Login' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

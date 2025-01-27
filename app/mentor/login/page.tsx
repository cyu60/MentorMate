"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from "@/components/navbar";
import { supabase } from "@/lib/supabase";

export default function MentorLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
        return;
      }
      if (session) {
        router.push('/mentor');
        return;
      }
      setLoading(false);
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/mentor');
      } else if (event === 'SIGNED_OUT') {
        router.push('/mentor/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border-2 border-blue-200">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md mb-6 text-center">
            <h2 className="text-2xl font-bold">Mentor Login</h2>
            <p className="text-sm mt-1">Access your mentor dashboard</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(30, 64, 175)', // blue-800
                    brandAccent: 'rgb(30, 58, 138)', // blue-900
                  },
                },
              },
            }}
            providers={['google', 'github']}
            view={isSignUp ? 'sign_up' : 'sign_in'}
          />
          <div className="mt-4 text-center">
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
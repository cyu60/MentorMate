"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
        router.push("/mentor");
        return;
      }
      setLoading(false);
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/mentor");
      } else if (event === "SIGNED_OUT") {
        router.push("/mentor/login");
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
    <>
      {/* <Navbar /> */}
      {/* <div className="flex min-h-screen flex-1 flex-col justify-center sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-100/80 items-center"> */}
      <div className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden bg-artistic bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
        {/* Header Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="MentorMate"
            src="/mentormate.png"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
            Mentor Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your mentor dashboard.
          </p>
        </div>

        {/* Auth Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-8 py-10 shadow-lg sm:rounded-lg">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "rgb(30, 64, 175)", // blue-800
                      brandAccent: "rgb(30, 58, 138)", // blue-900
                    },
                  },
                },
              }}
              providers={["google", "github"]}
              socialLayout="horizontal"
              view={isSignUp ? "sign_up" : "sign_in"}
            />
            <div className="mt-6 text-center">
              <p className="text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

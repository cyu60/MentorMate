"use client";

import { Navbar } from "@/components/navbar";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (session) {
        router.push("/participant");
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignUpToggle = () => {
    setIsSignUp((prev) => !prev);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-100/80 items-center">
        <Navbar />
        {/* Header Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="MentorMate"
            src="/mentormate.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="m-2 text-center text-2xl font-bold tracking-tight text-gray-900">
            {isSignUp ? "Sign Up" : "Sign in to your account"}
          </h2>
        </div>

        {/* Auth Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "darkblue",
                      brandAccent: "darkblue",
                    },
                  },
                },
              }}
              providers={["google", "github"]}
              socialLayout="horizontal"
              view={isSignUp ? "sign_up" : "sign_in"}
            />
            {/* <div className="mt-4 text-center">
              <p>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={handleSignUpToggle}
                  className="text-blue-500 hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

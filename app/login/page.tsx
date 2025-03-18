"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Navbar } from '@/components/layout/navbar';
import { Footer } from "@/components/layout/footer";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
      }
      if (session) {
        router.push("/select");
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        const errorMessage = error.message.includes("unique")
          ? "This email is already registered. Please sign in instead."
          : error.message;
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            email: data.user.email,
            display_name: data.user.email?.split("@")[0],
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      setLoading(false);
      router.push("/select");
      return;
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const errorMessage = error.message.includes("Invalid")
          ? "Invalid email or password"
          : error.message;
        setError(errorMessage);
        setLoading(false);
        return;
      }
      router.push("/select");
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setError("Password reset instructions sent to your email!");
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    localStorage.setItem("returnUrl", "/select");
    const returnUrl = localStorage.getItem("returnUrl");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const options = {
      provider,
      options: {
        redirectTo: `${baseUrl}/auth/callback${
          returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""
        }`,
      },
    };
    const { error } = await supabase.auth.signInWithOAuth(options);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleToggleAuthMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
  };

  return (
    <div className="pt-16">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          alt="MentorMates"
          src="/mentormate.png"
          width={40}
          height={40}
          className="mx-auto object-contain"
        />
        <h2 className="m-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          {isSignUp ? "Sign Up" : "Sign in to your account"}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[400px] pl-5 pr-5">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {error && (
            <div className="mb-4 text-center text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="font-semibold text-blue-900 hover:text-blue-500 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
            </div>

            {/* Sign in / Sign up button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:outline-2 focus:outline-blue-500"
              >
                {loading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                  ? "Sign up"
                  : "Sign in"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div>
            <div className="relative mt-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-white px-6 text-gray-900">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Providers */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleOAuthSignIn("google")}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span className="text-sm font-semibold">Google</span>
              </button>
              <button
                onClick={() => handleOAuthSignIn("github")}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold">GitHub</span>
              </button>
            </div>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <p className="mt-10 text-center text-sm text-gray-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleToggleAuthMode();
              }}
              className="font-semibold text-blue-900 hover:text-blue-500"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="pb-10 bg-gradient-to-b from-white to-blue-100/80 items-center">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}

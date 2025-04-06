"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyInviteToken } from "@/lib/inviteUtils";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function processInvite() {
      try {
        // Check if we have a token
        const token = searchParams.get("token");
        if (!token) {
          setError("Invalid invite link. No token provided.");
          setIsLoading(false);
          return;
        }

        // Verify the token
        const payload = verifyInviteToken(token);
        if (!payload) {
          setError("Invalid or expired invite link.");
          setIsLoading(false);
          return;
        }

        // Store token in localStorage for later processing after OAuth
        localStorage.setItem("inviteToken", token);

        // Get event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("event_name")
          .eq("event_id", payload.eventId)
          .single();

        if (eventError || !eventData) {
          setError("Event not found or has been deleted.");
          setIsLoading(false);
          return;
        }

        setEventName(eventData.event_name);
        setRoleName(payload.role.charAt(0).toUpperCase() + payload.role.slice(1));

        // Check if user is already authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing invite:", error);
        setError("An error occurred while processing the invite.");
        setIsLoading(false);
      }
    }

    processInvite();
  }, [searchParams, router]);

  const handleSignInWithOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    
    // Store the current URL to redirect back after auth
    localStorage.setItem("returnUrl", "/invite/process");
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const options = {
      provider,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    };
    
    const { error } = await supabase.auth.signInWithOAuth(options);
    
    if (error) {
      console.error("OAuth error:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleContinueWithSession = () => {
    router.push("/invite/process");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow bg-gradient-to-b from-white to-blue-100/80 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            <p className="mt-4 text-lg text-blue-900">Processing invite...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-b from-white to-blue-100/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4">
              <Image
                alt="MentorMates"
                src="/mentormate.png"
                width={40}
                height={40}
                className="mx-auto object-contain"
              />
            </div>
            <CardTitle className="text-center text-xl">
              {error ? "Invite Error" : `Join ${eventName}`}
            </CardTitle>
            <CardDescription className="text-center">
              {error ? "There was a problem with your invite link" : `You've been invited to join as a ${roleName}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : isAuthenticated ? (
              <div className="space-y-6">
                <p className="text-center text-sm text-gray-500">
                  You&apos;re already signed in. Click continue to join the event.
                </p>
                <Button
                  className="w-full bg-blue-900 hover:bg-blue-700"
                  onClick={handleContinueWithSession}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-center text-sm text-gray-500">
                  Sign in or create an account to join this event
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSignInWithOAuth("google")}
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
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSignInWithOAuth("github")}
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
                    GitHub
                  </Button>
                </div>
                
                <p className="text-center text-xs text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { processInvite } from "@/lib/inviteUtils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProcessInvitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState("");
  
  useEffect(() => {
    async function completeInviteProcess() {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem("inviteToken");
        if (!token) {
          setError("No invite token found. Please use a valid invite link.");
          setIsLoading(false);
          return;
        }

        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!session) {
          setError("You must be signed in to join an event");
          setIsLoading(false);
          return;
        }

        // Get user profile to assign role
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("uid")
          .eq("email", session.user.email)
          .single();
        
        if (profileError || !userProfile) {
          setError("User profile not found");
          setIsLoading(false);
          return;
        }

        // Process the invite and assign the role
        const result = await processInvite(token, userProfile.uid);
        
        if (!result.success) {
          setError(result.error || "Failed to process invite");
          setIsLoading(false);
          return;
        }

        // Clear the invite token from localStorage
        localStorage.removeItem("inviteToken");
        
        // Set success state and retrieve event ID for navigation
        const { data: userEventRole } = await supabase
          .from("user_event_roles")
          .select("event_id")
          .eq("user_id", userProfile.uid)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (userEventRole) {
          setEventId(userEventRole.event_id);
        }
        
        setIsSuccess(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing invite:", error);
        setError("An unexpected error occurred while processing your invite");
        setIsLoading(false);
      }
    }

    completeInviteProcess();
  }, [router]);

  const handleViewEvent = () => {
    if (eventId) {
      router.push(`/events/${eventId}/overview`);
    } else {
      router.push("/events");
    }
  };

  const handleGoToEvents = () => {
    router.push("/events");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-b from-white to-blue-100/80 flex items-center justify-center">
        <div className="max-w-lg w-full px-4">
          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
              <p className="mt-4 text-lg text-center">Processing your invitation...</p>
            </div>
          ) : isSuccess ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex flex-col items-center justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-center">Success!</h2>
                <p className="text-center text-gray-600 mt-2">
                  You&apos;ve successfully joined the event.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleViewEvent}
                  className="bg-blue-900 hover:bg-blue-700"
                >
                  View Event
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGoToEvents}
                >
                  See All Events
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline"
                  onClick={handleGoToEvents}
                >
                  Browse Events
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 
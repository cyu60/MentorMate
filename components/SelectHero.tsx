"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SelectHero() {
  const router = useRouter();
  
  const handleParticipantClick = async () => {
    localStorage.setItem('redirectToParticipant', 'true');
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking session:", error);
      return;
    }
    if (!session) {
      router.push("/login");
    } else {
      router.push("/");
      localStorage.removeItem('redirectToParticipant'); // Clean up immediately if we can redirect right away
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-artistic py-2 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-4 text-center">
        <h1 className="text-4xl font-bold mb-8 text-blue-900">
          Choose Your Role
        </h1>
        <div className="space-y-6">
          <p className="text-xl text-gray-700 mb-8">
            Are you participating in the event or helping to mentor and judge?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleParticipantClick}
              className="bg-blue-900 text-white px-8 py-6 text-lg"
            >
              I&apos;m a Participant
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg"
              onClick={() => {
                router.push("/mentor/login");
              }}
            >
              I&apos;m a Mentor/Judge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"
// import Image from "next/image";
import { Button } from "@/components/ui/button";
// import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function Hero() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (!session) {
        console.warn("No session found during fetch.");
      } else {
        console.log("Session fetched successfully:", session);
      }
      setSession(session);
      
      if (session) {
        const { email, user_metadata, id: uid } = session.user;
        const display_name = user_metadata?.name || (email ? email.split('@')[0] : 'user');
        try {
          // First check if user exists
          const { data: existingUser } = await supabase
            .from('user_profiles')
            .select()
            .eq('email', email)
            .single();

          // Only insert if user doesn't exist
          if (!existingUser) {
            const { error } = await supabase
              .from('user_profiles')
              .insert({
                display_name: display_name,
                email: email,
                uid: uid
              });
            if (error) {
              console.error("Error inserting user profile:", error);
            } else {
              console.log("User profile created successfully.");
            }
          } else {
            console.log("User profile already exists.");
          }
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      }
    };

    fetchSession();
  }, []);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleSignOutClick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      setSession(null);
      router.push("/");
    }
  };

  const handleParticipantClick = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking session:", error);
      return;
    }
    if (!session) {
      router.push("/login");
    } else {
      router.push("/participant");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-artistic">
      {/* <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-blue-100" /> */}
      {/* <BackgroundBeams /> */}
      <div className="absolute top-4 right-4 z-20">
        {session ? (
          <Button
            size="lg"
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition-all duration-300"
            onClick={handleSignOutClick}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-all duration-300"
            onClick={handleLoginClick}
          >
            Sign Up/Login
          </Button>
        )}
      </div>
      <div className="relative text-center py-16 max-w-4xl">
        <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
          <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            {/* <Image 
                src="/mentormate.png" 
                alt="Mentor Mate Logo" 
                width={50} 
                height={50} 
            /> */}
            Mentor Mate
          </span>
        </h1>
        <TextGenerateEffect
          words="Transform How Feedback is Given: MentorMates Helps You Foster Growth Through Generative AI-Powered Insights and Feedback."
          className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto font-light"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto button-gradient text-white font-semibold py-3 px-6 rounded-full shadow-lg"
            onClick={handleParticipantClick}
          >
            I&apos;m a Participant
            </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto bg-transparent border-2 border-blue-900 font-semibold py-3 px-6 rounded-full hover:bg-blue-900/30 transition-all duration-300"
            onClick={async () => {
              const { data: { session }, error } = await supabase.auth.getSession();
              if (error) {
                console.error("Error checking session:", error);
                return;
              }
              if (!session) {
                router.push("/mentor/login");
              } else {
                router.push("/mentor");
              }
            }}
          >
            I&apos;m a Mentor/Judge
          </Button>
        </div>
      </div>
    </div>
  );
}

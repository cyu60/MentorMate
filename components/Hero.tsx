"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export function Hero() {
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
      router.push("/participant");
      localStorage.removeItem('redirectToParticipant'); // Clean up immediately if we can redirect right away
    }
  };

  const [hasSession, setHasSession] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error);
        return;
      }
      if (session) {
        setHasSession(true);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (hasSession && !localStorage.getItem('redirectToParticipant') && currentPath !== "/mentor" && currentPath !== "/" && currentPath !== "/select") {
      router.push("/mentor");
    }
  }, [hasSession, router]);

  return (
    <div className="relative flex flex-col overflow-hidden bg-artistic">
      {/* <BackgroundBeams /> */}
      <div className="flex items-center justify-center">
        <div className="relative text-center max-w-4xl">
          <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
            <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
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
                if (session) {
                  router.push("/mentor");
                } else {
                  setShowDialog(true);
                }
              }}
            >
              I&apos;m a Mentor/Judge
            </Button>
            {showDialog && (
              <Dialog open={true} onOpenChange={setShowDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Welcome Mentor!</DialogTitle>
                    <DialogDescription>
                      Would you like to continue with an account? Creating an account allows you to save and track your mentoring history and allows users to interact with your feedback.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        router.push("/mentor");
                      }}
                    >
                      Continue Without Login
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDialog(false);
                        router.push("/mentor/login");
                      }}
                      className="bg-blue-900 text-white"
                    >
                      Login
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="mt-24 text-center space-y-4">
            <p className="text-sm text-gray-600 font-medium tracking-wide uppercase">
              Supported by:
            </p>
            <div className="relative w-[200px] h-[100px] mx-auto">
              <Image
                src="https://clinicalmindai.stanford.edu/sites/g/files/sbiybj31566/files/styles/responsive_large/public/media/image/motif_text-stanford_accelerator_for_learning_rgb_1_1.png.webp?itok=b--D-kMe"
                alt="Stanford Accelerator for Learning"
                fill
                className="object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

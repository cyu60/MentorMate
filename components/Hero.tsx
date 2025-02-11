"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Hero() {
  const router = useRouter();

  const handleParticipantClick = async () => {
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
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-artistic">
      {/* <BackgroundBeams /> */}
      <div className="flex items-center justify-center">
        <div className="relative text-center py-16 max-w-4xl">
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

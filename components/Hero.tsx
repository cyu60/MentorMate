"use client";

import Image from "next/image";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function Hero() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Error fetching session:", error);
        return;
      }
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User");
    };

    fetchUserName();
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden bg-artistic">
      <div className="flex items-center justify-center">
        <div className="relative text-center max-w-4xl">
          <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
            <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
              Mentor Mate
            </span>
          </h1>
          <h2 className="text-2xl text-gray-800 mb-6">
            Welcome back, {userName}!
          </h2>
          <TextGenerateEffect
            words="Ready to explore feedback and insights? Let's make learning more meaningful together."
            className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto"
          />
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

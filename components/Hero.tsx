import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export function Hero() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-artistic">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-blue-100" />
      <BackgroundBeams />
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
          {/* Welcome to  {" "} */}
          <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            <Image 
                src="/mentormate.png" 
                alt="Mentor Mate Logo" 
                width={50} 
                height={50} 
            />
            Mentor Mate
          </span>
        </h1>
        <TextGenerateEffect
          words="Transform How Feedback is Given: MentorMates Helps You Foster Growth Through Generative AI-Powered Insights and Feedback."
          className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto font-light"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/participant">
            <Button
              size="lg"
              className="w-full sm:w-auto button-gradient text-white font-semibold py-3 px-6 rounded-full shadow-lg"
            >
              I&apos;m a Participant
            </Button>
          </Link>
          <Link href="/mentor">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-2 border-blue-900 font-semibold py-3 px-6 rounded-full hover:bg-blue-900/30 transition-all duration-300"
            >
              I&apos;m a Mentor/Judge
            </Button>
          </Link>
        </div>
        <div className="mt-24 text-center space-y-4">
          <p className="text-sm text-gray-600 font-medium tracking-wide uppercase">
            Supported by:
          </p>
          <img
            src="https://clinicalmindai.stanford.edu/sites/g/files/sbiybj31566/files/styles/responsive_large/public/media/image/motif_text-stanford_accelerator_for_learning_rgb_1_1.png.webp?itok=b--D-kMe"
            alt="Stanford Accelerator for Learning"
            className="max-w-[200px] h-auto mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
}

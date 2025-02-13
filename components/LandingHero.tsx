"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Lightbulb, Target } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LandingHero() {
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

  return (
    <div className="min-h-screen bg-artistic py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-4">
        <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
          <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            Mentor Mate
          </span>
        </h1>
        <div className="space-y-8 text-center">
          <p className="text-xl italic font-medium text-gray-800 max-w-3xl mx-auto leading-relaxed">
            Need better feedback than generic comments for your{" "}
            <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
              hackathons
            </span>
            ,{" "}
            <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
              projects
            </span>
            , and{" "}
            <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
              presentations
            </span>
            ?
          </p>
          <TextGenerateEffect
            words="Elevate your project with smart, actionable and encouraging feedback that drives real learning."
            className="text-xl text-blue-100 max-w-3xl mx-auto font-light"
          />
            <Dialog>
            <DialogTrigger asChild>
              <div>
              <Button
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-full text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogDescription>
                Are you a participant or a mentor/judge? Please select an option to proceed.
              </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                onClick={handleParticipantClick}
                className="bg-blue-900 text-white"
              >
                I&apos;m a Participant
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                router.push("/mentor/login");
                }}
              >
                I&apos;m a Mentor/Judge
              </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              icon: Users,
              title: "Targeted Feedback",
              description:
                "Pinpoint insights that help you continually improve.",
            },
            {
              icon: Lightbulb,
              title: "Actionable Guidance",
              description: "Clear steps to drive your projects forward.",
            },
            {
              icon: Target,
              title: "Uplifting Support",
              description: "Encouraging insights to boost your strengths.",
            },
          ].map((item, index) => (
            <div key={index} className="text-center bg-white/50 p-4 rounded-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-900 mb-4 mx-auto">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
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
          <p className="text-md text-gray-600 max-w-3xl mx-auto pt-2">
            Mentor Mate is built at Stanford Graduate School of Education and
            supported by the Stanford Accelerator for Learning—backed by the
            latest advances in learning sciences and pedagogy.
          </p>
        </div>

        <div className="mt-16 bg-blue-900 rounded-2xl max-w-5xl mx-auto shadow-xl overflow-hidden">
          <div className="py-8 px-4 sm:px-6 lg:py-12 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to start your journey?</span>
              <span className="block text-blue-200 mt-2">
                Join MentorMates today.
              </span>
            </h2>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/select"
                  className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-blue-200/20 hover:text-white transition-colors duration-300"
                >
                  Get Started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-blue-200 hover:text-blue-900 transition-colors duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Lightbulb, Target } from "lucide-react";
// import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="min-h-screen bg-artistic py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-4">
        <h1 className="text-5xl sm:text-3xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
          <span className="flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            Mentor Mates
          </span>
        </h1>
        <div className="space-y-8 text-center">
          <h2 className="text-2xl font-medium text-gray-800 max-w-3xl mx-auto leading-relaxed">
            All-in-One Platform for{" "}
            <div className="inline-flex flex-col h-[40px] overflow-hidden">
              <div className="animate-word-slide flex flex-col">
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Student Hackathons
                </span>
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Game Jams
                </span>
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Pitch Competitions
                </span>
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Innovation Challenges
                </span>
              </div>
            </div>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your all-in-one solution—no need for multiple platforms. Simplify
            event logistics and access comprehensive resources to learn about
            hackathons and build ideas that stick.
          </p>
          {/* <TextGenerateEffect
            words="Elevate your project with smart, actionable and encouraging feedback that drives real learning."
            className="text-xl text-blue-100 max-w-3xl mx-auto font-light"
          /> */}
          <Link href="/select-role">
            <Button className="inline-flex items-center mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-full text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300">
              Get Started
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {[
          {
            icon: Users,
            title: "Targeted Feedback",
            description: "Pinpoint insights that help you continually improve.",
          },
          {
            icon: Lightbulb,
            title: "Simplified Logistics",
            description: "Streamlined event management and team coordination.",
          },
          {
            icon: Target,
            title: "Continuous Learning",
            description:
              "Resources to master hackathons and build impactful projects.",
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
                href="/select-role"
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

      <style jsx>{`
        @keyframes slideWords {
          0%,
          20% {
            transform: translateY(0%);
          }
          25%,
          45% {
            transform: translateY(-25%);
          }
          50%,
          70% {
            transform: translateY(-50%);
          }
          75%,
          95% {
            transform: translateY(-75%);
          }
          100% {
            transform: translateY(-100%);
          }
        }

        .animate-word-slide {
          animation: slideWords 8s infinite;
        }

        .animate-word-slide span {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .animate-word-slide {
          /* Add the first item again at the bottom to create seamless loop */
          transform: translateY(0);
        }

        .animate-word-slide span:first-child {
          /* Clone the first item to the bottom */
          position: relative;
        }

        .animate-word-slide span:first-child::after {
          content: "Student Hackathons";
          position: absolute;
          top: 160px; /* 4 * 40px to position after the last item */
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(147, 197, 253, 0.3);
          border-radius: 0.25rem;
          color: rgb(30, 58, 138);
          font-weight: 700;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
}

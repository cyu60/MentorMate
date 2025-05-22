"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Lightbulb, Target } from "lucide-react";
// import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-50">
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50" />
      <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />

      {/* Hero Section */}
      <div className="relative z-10 px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 flex items-center justify-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-400">
              Mentor Mates
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 max-w-3xl mx-auto leading-relaxed">
            All-in-One Platform for{" "}
            <div className="inline-flex flex-col h-[40px] overflow-hidden align-middle">
              <div className="animate-word-slide flex flex-col">
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Student Hackathons
                </span>
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Game Jams
                </span>
                <span className="text-blue-900 font-bold bg-blue-300/30 px-2 py-1 rounded">
                  Demo Day
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
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4 mb-8">
            Built <strong>by students, for students</strong>, and backed by{" "}
            <strong>learning sciences</strong> and <strong>pedagogy</strong>,
            Mentor Mates guides you through every step of your hackathon,
            Demo Day, or innovation event. From structured learning resources to streamlined
            logistics, our platform helps you focus on what truly matters:
            creating <em>impactful</em> projects.
          </p>

          {/* Call to Action */}
          <div className="mt-8">
            <Link href="/login" className="inline-block">
              <Button className="inline-flex items-center px-6 py-3 text-base font-medium rounded-full text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300">
                Get Started
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20">
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Peer Feedback",
              description:
                "Leverage peer feedback and support to improve.",
            },
            {
              icon: Lightbulb,
              title: "Simplified Logistics",
              description:
                "Streamlined event management and team coordination.",
            },
            {
              icon: Target,
              title: "Continuous Learning",
              description:
                "Resources to master hackathons and build impactful projects.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-900 mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported by Stanford */}
      <div className="relative z-10 mt-20 text-center px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-600 font-medium tracking-wide uppercase mb-6">
          Supported by:
        </p>
        <div className="mx-auto relative w-[200px] h-[100px]">
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

      {/* Final CTA Section */}
      <div className="relative z-10 mt-20 mb-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to start your journey?</span>
              <span className="block text-blue-200 mt-2">
                Join MentorMates today.
              </span>
            </h2>

            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-blue-200/20 hover:text-white transition-colors duration-300"
              >
                Get Started
              </Link>
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

      {/* Word Slide Animation */}
      <style jsx>{`
        @keyframes slideWords {
          0%,
          16% {
            transform: translateY(0%);
          }
          20%,
          36% {
            transform: translateY(-20%);
          }
          40%,
          56% {
            transform: translateY(-40%);
          }
          60%,
          76% {
            transform: translateY(-60%);
          }
          80%,
          96% {
            transform: translateY(-80%);
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

        /* Cloned first item for a seamless loop */
        .animate-word-slide span:first-child {
          position: relative;
        }
        .animate-word-slide span:first-child::after {
          content: "Student Hackathons";
          position: absolute;
          top: 200px;
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

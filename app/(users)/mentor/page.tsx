"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ReturnUrlHandler } from "@/components/ReturnUrlHandler";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export default function MentorPage() {
  const router = useRouter();

  useEffect(() => {
    const returnUrl = localStorage.getItem("returnUrl");
    console.log("returnUrl:", returnUrl);
    if (returnUrl) {
      localStorage.removeItem("returnUrl");
      console.log("Redirecting to:", returnUrl); 
      router.push(returnUrl);
    }
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <ReturnUrlHandler />
      <div className="relative z-10 container mx-auto py-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
          Mentor Dashboard
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={() => router.push("/mentor/scan")}
            className="relative block w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <span className="min-h-1/2-screen mt-2 block text-sm font-semibold text-gray-900">
              Start Scanning
            </span>
          </button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

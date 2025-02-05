"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MentorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        router.push('/');
        return;
      }

      if (!session) {
        router.push('/mentor/login');
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <div className="relative z-10 container mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
          Mentor Dashboard
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 px-4 sm:px-6 md:px-8 lg:px-40"
        >
          <Card className="bg-white backdrop-blur-md border-blue-200/20">
            <CardContent className="p-4 sm:p-6">
              <Button
                onClick={() => router.push('/mentor/scan')}
                className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue to Scan
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

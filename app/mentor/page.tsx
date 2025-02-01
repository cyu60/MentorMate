"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MentorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
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

      setSession(session);
      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your mentor account.",
      });
      
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
        <Button
          size="lg"
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition-all duration-300 mb-2"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
        {session && (
          <div className="text-sm text-gray-700">
            Logged in as: {session.user.email}
          </div>
        )}
      </div>
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

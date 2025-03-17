"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { LandingHero } from "@/components/LandingHero";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

// const reflections = [
//   {
//     id: 1,
//     date: "Feb 23, 2025",
//     title: "First Week Progress",
//     content: "Started working on the UI components. Learning React has been challenging but rewarding.",
//     tags: ["React", "UI/UX"],
//   },
//   {
//     id: 2,
//     date: "Feb 22, 2025",
//     title: "Team Collaboration",
//     content: "Great session with my mentor today. Learned about the importance of code review practices.",
//     tags: ["Mentorship", "Collaboration"],
//   },
// ]

// const learningData = [
//   { week: "Week 1", progress: 20 },
//   { week: "Week 2", progress: 45 },
//   { week: "Week 3", progress: 65 },
//   { week: "Week 4", progress: 90 },
// ]

// const achievements = [
//   { id: 1, title: "First PR Merged", description: "Successfully merged first pull request" },
//   { id: 2, title: "Team Collaboration", description: "Completed first team project milestone" },
//   { id: 3, title: "Technical Growth", description: "Mastered new framework concepts" },
// ]

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      console.log("Current session data:", JSON.stringify(currentSession, null, 2));
      if (error) {
        console.error("Error getting session:", error);
      }

      if (currentSession?.user) {
        // Sync user profile data
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            email: currentSession.user.email,
            display_name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0]
          }, {
            onConflict: 'email'
          });

        if (upsertError) {
          console.error("Error upserting user profile:", upsertError);
        }
      }

      setSession(currentSession);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
        <LandingHero />
        <ServiceWorkerRegistration />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-6xl font-extrabold mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            Welcome to MentorMates
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TextGenerateEffect
            words="Find your event to start getting personalized feedback and guidance for your projects."
            className="text-xl text-gray-700 max-w-3xl mx-auto mb-10"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6"
        >
          <Link href="/events">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Browse Events
            </Button>
          </Link>
        </motion.div>
      </div>
      <ServiceWorkerRegistration />
    </div>
  ); /*}

  // Original dashboard code commented out
  /* return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">MentorMate</h1>

        {/* Reflections Section */
  // <section className="mb-12">
  //   <div className="flex items-center justify-between mb-6">
  //     <h2 className="text-2xl font-semibold">My Reflections</h2>
  //     <Button className="bg-black text-white hover:bg-black/90">
  //       <Plus className="w-4 h-4 mr-2" />
  //       Add Reflection
  //     </Button>
  //   </div>
  //   <div className="grid gap-6 md:grid-cols-2">
  //     {reflections.map((reflection) => (
  //       <Card key={reflection.id}>
  //         <CardHeader>
  //           <div className="flex justify-between items-start">
  //             <CardTitle>{reflection.title}</CardTitle>
  //             <span className="text-sm text-gray-500">{reflection.date}</span>
  //           </div>
  //         </CardHeader>
  //         <CardContent>
  //           <p className="mb-4 text-gray-600">{reflection.content}</p>
  //           <div className="flex gap-2">
  //             {reflection.tags.map((tag) => (
  //               <Badge key={tag} variant="secondary">
  //                 {tag}
  //               </Badge>
  //             ))}
  //           </div>
  //         </CardContent>
  //       </Card>
  //     ))}
  //   </div>
  // </section>;

  {
    /* Learning Progress Section */
    /*}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Track My Learning</h2>

          {/* Learning Progress Chart */
    /*}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningData}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Main Learning Comments */
    /*}
          <Card>
            <CardHeader>
              <CardTitle>Learning Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Current Focus</h3>
                  <p className="text-gray-600">Developing proficiency in React and modern web development practices.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Key Learnings</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Mastered component-based architecture</li>
                    <li>Improved understanding of state management</li>
                    <li>Enhanced debugging and problem-solving skills</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */
    /*}
          <Card>
            <CardHeader>
              <CardTitle>Learning Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  ) */
  }
}

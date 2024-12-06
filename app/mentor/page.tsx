'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { motion } from "framer-motion"

export default function MentorPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkMentorDetails = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mentorId = localStorage.getItem("mentorId")
      const mentorName = localStorage.getItem("mentorName")
      const mentorEmail = localStorage.getItem("mentorEmail")

      if (mentorId && mentorName && mentorEmail) {
        router.push("/mentor/scan")
      }
      setIsLoading(false)
    }

    checkMentorDetails()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("mentors")
        .insert({ name, email })
        .select()

      if (error) throw error

      localStorage.setItem("mentorId", data[0].id)
      localStorage.setItem("mentorName", name)
      localStorage.setItem("mentorEmail", email)

      router.push("/mentor/scan")
    } catch (error) {
      console.error("Error registering mentor:", error)
      toast({
        title: "Registration Failed",
        description: "There was an error registering. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 p-10">
      <div className="relative z-10 container mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
          Mentor Registration
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white backdrop-blur-md border-blue-200/20">
              <CardHeader>
                <CardTitle className="text-blue-900 text-2xl font-semibold">Welcome, Mentor!</CardTitle>
                <CardDescription className="text-gray-800">Please enter your details to continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <div className="mt-4 mb-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full button-gradient text-white font-semibold mt-3 py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Continue to Scan'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}


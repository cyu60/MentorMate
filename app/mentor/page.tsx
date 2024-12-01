'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function MentorPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('mentors')
        .insert({ name, email })
        .select()

      if (error) throw error

      localStorage.setItem('mentorId', data[0].id)
      localStorage.setItem('mentorName', name)
      localStorage.setItem('mentorEmail', email)

      router.push('/mentor/scan')
    } catch (error) {
      console.error('Error registering mentor:', error)
      toast({
        title: 'Registration Failed',
        description: 'There was an error registering. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mentor Registration</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email"
            required
          />
        </div>
        <Button type="submit" className="w-full">Continue to Scan</Button>
      </form>
    </div>
  )
}


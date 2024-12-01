import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface MentorRegistrationModalProps {
  isOpen: boolean
  onClose: (mentorInfo?: { id: string; name: string; email: string }) => void
}

export function MentorRegistrationModal({ isOpen, onClose }: MentorRegistrationModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('mentors')
        .insert({ name, email })
        .select()

      if (error) throw error

      if (data && data[0]) {
        const mentorInfo = { id: data[0].id, name, email }
        localStorage.setItem('mentorId', mentorInfo.id)
        localStorage.setItem('mentorName', mentorInfo.name)
        localStorage.setItem('mentorEmail', mentorInfo.email)

        toast({
          title: 'Registration Successful',
          description: 'You have been registered as a mentor.',
        })

        onClose(mentorInfo)
      } else {
        throw new Error('No data returned from mentor registration')
      }
    } catch (error) {
      console.error('Error registering mentor:', error)
      toast({
        title: 'Registration Failed',
        description: 'There was an error registering. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mentor Registration</DialogTitle>
          <DialogDescription>
            Please register as a mentor to submit feedback.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
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
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


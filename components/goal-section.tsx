'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

interface GoalSectionProps {
  eventId?: string // Make optional since we'll get from URL if not provided
}

interface Goal {
  id: string
  user_id: string  // UUID from auth.users
  event_id: string
  type: 'goal' | 'journal'
  content: string
  display_name: string
  created_at: string
  updated_at: string
}

export default function GoalSection() {
  const params = useParams()
  const eventId = params.id as string
  const [goals, setGoals] = useState<Goal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (eventId) {
      fetchGoals()
    }
  }, [eventId])

  const fetchGoals = async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id) return

    // Get goals for the current user
    const { data, error } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", eventId)
      .eq("type", "goal")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error fetching goals",
        description: "Please try again later",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setGoals(data)
    }
  }

  const handleSetGoal = () => {
    setIsDialogOpen(true)
  }

  const handleSubmitGoal = async () => {
    console.log("handleSubmitGoal called")
    if (!newGoal.trim()) {
      console.log("Empty goal, returning")
      return
    }

    const { data: session } = await supabase.auth.getSession()
    console.log("Session:", session)
    if (!session?.session?.user?.id) {
      toast({
        title: "Authentication error",
        description: "Please sign in to set goals",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from("platform_engagement")
      .insert([
        {
          event_id: eventId,
          user_id: session.session.user.id,
          type: "goal",
          content: newGoal.trim(),
          display_name: session.session.user.user_metadata.full_name
        }
      ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error setting goal:", error)
      toast({
        title: "Error setting goal",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Goal set successfully",
      description: "Your goal has been saved",
    })
    
    setNewGoal("")
    setIsDialogOpen(false)
    fetchGoals()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Goals</CardTitle>
          <Button
            onClick={handleSetGoal}
            className="bg-black text-white hover:bg-black/90"
          >
            Set Goal
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-gray-500">No goals set yet. Click the button above to set your first goal!</p>
          ) : (
            <ul className="space-y-2">
              {goals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-2">
                  <span>• {goal.content}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set a New Goal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter your goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitGoal()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitGoal}
              disabled={isSubmitting || !newGoal.trim()}
              className="bg-black text-white hover:bg-black/90"
            >
              {isSubmitting ? 'Setting...' : 'Set Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

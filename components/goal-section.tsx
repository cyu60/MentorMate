'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { Pencil, CheckCircle2, XCircle } from "lucide-react"

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
  status: 'in_progress' | 'completed'
}

const goalRecommendations = [
  "Complete project documentation with detailed architecture diagrams by [date]",
  "Implement core feature X with 90% test coverage by [date]",
  "Create 5 user stories and get team approval by [date]",
  "Set up CI/CD pipeline with automated testing by [date]",
  "Conduct 3 user interviews and document feedback by [date]"
]

export default function GoalSection({ eventId: propEventId }: GoalSectionProps) {
  const params = useParams()
  const eventId = propEventId || params.id as string
  const [goals, setGoals] = useState<Goal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const { toast } = useToast()

  const fetchGoals = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id) return

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
  }, [eventId, toast])

  useEffect(() => {
    if (eventId) {
      fetchGoals()
    }
  }, [eventId, fetchGoals])

  const incrementPulse = async (userEmail: string) => {
    // First get current pulse value
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('pulse')
      .eq('email', userEmail)
      .single()

    if (fetchError) {
      console.error('Error fetching pulse:', fetchError)
      return
    }

    const currentPulse = profiles?.pulse || 0
    const newPulse = currentPulse + 1

    // Update with new pulse value
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ pulse: newPulse })
      .eq('email', userEmail)

    if (updateError) {
      console.error('Error updating pulse:', updateError)
      toast({
        title: "Error updating pulse",
        description: updateError.message || "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleSetGoal = () => {
    setIsDialogOpen(true)
  }

  const handleSubmitGoal = async () => {
    if (!newGoal.trim()) return

    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id || !session.session.user.email) {
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
          display_name: session.session.user.user_metadata.full_name,
          status: 'in_progress'
        }
      ])

    if (error) {
      toast({
        title: "Error setting goal",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Increment pulse when goal is added
    await incrementPulse(session.session.user.email)

    setIsSubmitting(false)
    toast({
      title: "Goal set successfully",
      description: "Your goal has been saved",
    })
    
    setNewGoal("")
    setIsDialogOpen(false)
    fetchGoals()
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setEditedContent(goal.content)
  }

  const handleSaveEdit = async (goalId: string) => {
    if (!editedContent.trim()) return

    const { error } = await supabase
      .from("platform_engagement")
      .update({ content: editedContent.trim() })
      .eq("id", goalId)

    if (error) {
      toast({
        title: "Error updating goal",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Goal updated successfully",
      description: "Your changes have been saved",
    })

    setEditingGoalId(null)
    setEditedContent("")
    fetchGoals()
  }

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed'
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id || !session.session.user.email) return

    const { error } = await supabase
      .from("platform_engagement")
      .update({ status: newStatus })
      .eq("id", goal.id)

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      return
    }

    // Increment pulse when goal is completed
    if (newStatus === 'completed') {
      await incrementPulse(session.session.user.email)
    }

    fetchGoals()
  }

  const handleSelectRecommendation = (recommendation: string) => {
    setNewGoal(recommendation)
  }

  return (
    <>
      <Card className="w-full">
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
            <ul className="space-y-4">
              {goals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {goal.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">In Progress</span>
                      </div>
                    )}
                  </div>
                  {editingGoalId === goal.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(goal.id)}
                        className="bg-black text-white hover:bg-black/90"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingGoalId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className={goal.status === 'completed' ? 'line-through text-gray-500' : ''}>
                        {goal.content}
                      </span>
                      <div className="flex items-center gap-2">
                        {goal.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(goal)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
          <div className="space-y-4">
            <div>
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
            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations for specific and measurable goals:</h4>
              <ul className="space-y-2">
                {goalRecommendations.map((recommendation, index) => (
                  <li
                    key={index}
                    className="text-sm p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleSelectRecommendation(recommendation)}
                  >
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
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

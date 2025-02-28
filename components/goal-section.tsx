import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface GoalSectionProps {
  eventId: string
}

export default function GoalSection({ eventId }: GoalSectionProps) {
  const [goals, setGoals] = useState<string[]>([])

  const handleSetGoal = () => {
    // TODO: Implement goal setting dialog/form
    console.log("Setting goal for event:", eventId)
  }

  return (
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
            {goals.map((goal, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>• {goal}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

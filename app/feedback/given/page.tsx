"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function GivenFeedbackPage() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8">Given Feedback</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No feedback given yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ReceivedFeedbackPage() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Received Feedback</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No feedback received yet</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
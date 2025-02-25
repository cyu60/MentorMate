"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function EventsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Events</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
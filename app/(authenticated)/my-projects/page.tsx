"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function MyProjectsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-8">My Projects</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No active projects</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
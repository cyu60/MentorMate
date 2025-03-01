"use client"

import { Card } from "@/components/ui/card"

export default function WhiteboardPage() {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Whiteboard</h1>
      <div className="space-y-4">
        <p className="text-gray-600">
          Collaborate with your team using our interactive whiteboard.
        </p>
        {/* Whiteboard functionality will be implemented here */}
      </div>
    </Card>
  )
}
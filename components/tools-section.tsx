"use client"

import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Pencil, Globe } from "lucide-react"

export default function ToolsSection() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const navigateToTool = (tool: string) => {
    router.push(`/events/${eventId}/tools/${tool}`)
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Tools</h2>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigateToTool('brainstormer')}
          className="bg-black text-white hover:bg-black/90 justify-start h-12"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          AI Brainstormer
        </Button>
        <Button
          onClick={() => navigateToTool('whiteboard')}
          className="bg-black text-white hover:bg-black/90 justify-start h-12"
        >
          <Pencil className="w-5 h-5 mr-2" />
          Whiteboard
        </Button>
        <Button
          onClick={() => navigateToTool('website-builder')}
          className="bg-black text-white hover:bg-black/90 justify-start h-12"
        >
          <Globe className="w-5 h-5 mr-2" />
          Website Builder
        </Button>
      </div>
    </Card>
  )
}


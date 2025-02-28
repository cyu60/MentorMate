"use client"

"use client"

import dynamic from "next/dynamic"
import { Suspense, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const GoalSection = dynamic(() => import("@/components/goal-section"), {
  ssr: false,
})
const ProjectDashboardSection = dynamic(() => import("@/components/project-dashboard-section"), {
  ssr: false,
})
const ToolsSection = dynamic(() => import("@/components/tools-section"), {
  ssr: false,
})

interface DashboardContentProps {
  eventId: string
}

export default function DashboardContent({ eventId }: DashboardContentProps) {
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectId = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("event_id", eventId)
        .single()

      if (!error && data) {
        setProjectId(data.id)
      }
    }

    fetchProjectId()
  }, [eventId])

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading goals...</div>}>
        <GoalSection eventId={eventId} />
      </Suspense>
      {projectId && (
        <Suspense fallback={<div>Loading project...</div>}>
          <ProjectDashboardSection eventId={eventId} projectId={projectId} />
        </Suspense>
      )}
      <Suspense fallback={<div>Loading tools...</div>}>
        <ToolsSection />
      </Suspense>
    </div>
  )
}
"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const GoalSection = dynamic(() => import("@/components/goal-section"), {
  ssr: false,
})
const MyProjectSection = dynamic(() => import("@/components/my-project-section"), {
  ssr: false,
})
const ToolsSection = dynamic(() => import("@/components/tools-section"), {
  ssr: false,
})

interface DashboardContentProps {
  eventId: string
}

export default function DashboardContent({ eventId }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading goals...</div>}>
        <GoalSection eventId={eventId} />
      </Suspense>
      <Suspense fallback={<div>Loading project...</div>}>
        <MyProjectSection eventId={eventId} />
      </Suspense>
      <Suspense fallback={<div>Loading tools...</div>}>
        <ToolsSection />
      </Suspense>
    </div>
  )
}
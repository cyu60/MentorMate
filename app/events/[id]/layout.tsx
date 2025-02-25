import type React from "react"
import { HackathonHeader } from "../../../components/hackathon-header"
import { HackathonNav } from "../../../components/hackathon-nav"
import { JournalSection } from "../../../components/journal-section"
import ToolsSection from "../../../components/tools-section"

export default function HackathonLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <HackathonHeader name="TreeHacks 2025" />
      <HackathonNav id={params.id} />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">{children}</div>
            <div className="lg:col-span-1 space-y-6">
              <ToolsSection />
              <JournalSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


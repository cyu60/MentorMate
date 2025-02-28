import type React from "react"
import { HackathonHeader } from "@/components/hackathon-header"
import { HackathonNav } from "@/components/hackathon-nav"
import { JournalSection } from "@/components/journal-section"
import { createSupabaseClient } from "@/app/utils/supabase/server"
import { notFound } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
  params: { id: string }
}

export default async function HackathonLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await Promise.resolve(params)
  const supabase = createSupabaseClient()

  // Fetch event details
  const { data: event } = await supabase
    .from("events")
    .select("event_name")
    .eq("event_id", id)
    .single()

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HackathonHeader name={event.event_name} />
      <HackathonNav id={id} />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">{children}</div>
            <div className="lg:col-span-1 space-y-6">
              <JournalSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
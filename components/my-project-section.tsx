import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface MyProjectSectionProps {
  eventId: string
}

interface Project {
  id: string
  project_name: string
  project_description: string
  teammates: string[]
  lead_name: string
}

export default function MyProjectSection({ eventId }: MyProjectSectionProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("event_id", eventId)
        .single()

      if (error) {
        console.error("Error fetching project:", error)
        setProject(null)
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    fetchProject()
  }, [eventId])

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading project data...</p>
      </Card>
    )
  }

  if (!project) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Project</h2>
          <Link href={`/events/${eventId}/participant`}>
            <Button className="bg-black text-white hover:bg-black/90">
              Submit My Project
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">
          No project submitted yet! Click the button above to submit your project.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Project</h2>
        <Link href={`/events/${eventId}/dashboard/${project.id}`}>
          <Button className="bg-black text-white hover:bg-black/90">
            View Dashboard
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Project Name</h3>
          <p>{project.project_name}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p>{project.project_description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Members</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>{project.lead_name} (Lead)</li>
            {project.teammates.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

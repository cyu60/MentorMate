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
  lead_email: string
  project_url?: string | null
  additional_materials_url?: string | null
  cover_image_url?: string | null
}

export default function MyProjectSection({ eventId }: MyProjectSectionProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          project_name,
          project_description,
          teammates,
          lead_name,
          lead_email,
          project_url,
          additional_materials_url,
          cover_image_url
        `)
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
      <Card className="overflow-hidden">
        <div
          className="h-[200px] w-full bg-[#000080]"
          style={project.cover_image_url ? {
            backgroundImage: `url(${project.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        />
        <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Project</h2>
          <Link href={`/events/${eventId}/submit`}>
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
    <Card className="overflow-hidden">
      <div
        className="h-[200px] w-full bg-[#000080]"
        style={project.cover_image_url ? {
          backgroundImage: `url(${project.cover_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
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
          <p className="text-gray-700">{project.project_name}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Submitted by</h3>
          <div className="ml-4 space-y-1">
            <div>
              <span className="font-bold text-gray-600">Name: </span>
              <span className="text-gray-700">{project.lead_name}</span>
            </div>
            <div>
              <span className="font-bold text-gray-600">Email: </span>
              <span className="text-gray-700">{project.lead_email}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Members</h3>
          <div className="flex flex-wrap gap-2">
            {[project.lead_name, ...project.teammates].map((member, index) => {
              const colors = ["blue", "deepskyblue", "royalblue", "teal"];
              const color = colors[index % colors.length];
              let className = "";

              switch (color) {
                case "deepskyblue":
                  className = "inline-flex items-center rounded-full bg-sky-200 px-2 py-1 text-xs font-medium text-sky-800";
                  break;
                case "blue":
                  className = "inline-flex items-center rounded-full bg-blue-200 px-2 py-1 text-xs font-medium text-blue-800";
                  break;
                case "teal":
                  className = "inline-flex items-center rounded-full bg-teal-200 px-2 py-1 text-xs font-medium text-teal-800";
                  break;
                case "royalblue":
                  className = "inline-flex items-center rounded-full bg-blue-300 px-2 py-1 text-xs font-medium text-blue-900";
                  break;
                default:
                  className = "inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600";
              }

              return (
                <span key={`${member}-${index}`} className={className}>
                  {member}{index === 0 ? " (Lead)" : ""}
                </span>
              );
            })}
          </div>
        </div>
        <div className="bg-blue-100/70 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Description</h3>
          <p className="text-sm font-normal text-gray-700">{project.project_description}</p>
        </div>
        {(project.project_url || project.additional_materials_url) && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">Project Resources</h3>
            {project.project_url && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Project Repository
                </a>
              </div>
            )}
            {project.additional_materials_url && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <a
                  href={project.additional_materials_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Download Project Materials
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProjectSubmissionFormComponent } from '@/components/ProjectSubmissionForm'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
}

export default function ParticipantPage() {
  const [existingProjects, setExistingProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      // Simulate a delay to show the loading spinner
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Retrieve existing projects from local storage
      const projects: Project[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('project_')) {
          const project = JSON.parse(localStorage.getItem(key) || '{}')
          projects.push(project)
        }
      }
      setExistingProjects(projects)
      setIsLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Participant Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {existingProjects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {existingProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle>{project.project_name}</CardTitle>
                      <CardDescription>{project.project_description.slice(0, 100)}...</CardDescription>
                      <Link href={`/participant/dashboard/${project.id}`}>
                        <Button className="mt-2">View Project</Button>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-center">Submit a New Project</h2>
            <ProjectSubmissionFormComponent />
          </div>
        </>
      )}
    </div>
  )
}


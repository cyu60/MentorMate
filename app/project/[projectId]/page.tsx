import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import FeedbackForm from '@/components/FeedbackForm'

export const revalidate = 0

async function getProjectData(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export default async function ProjectFeedbackPage({ params }: { params: { projectId: string } }) {
  const projectData = await getProjectData(params.projectId)

  if (!projectData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Project Feedback</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Project Details</h2>
        <p><strong>Project Name:</strong> {projectData.project_name}</p>
        <p><strong>Lead Name:</strong> {projectData.lead_name}</p>
        <p><strong>Lead Email:</strong> {projectData.lead_email}</p>
        <p><strong>Description:</strong> {projectData.project_description}</p>
      </div>
      <FeedbackForm 
        projectId={params.projectId} 
        projectName={projectData.project_name} 
        projectDescription={projectData.project_description}
      />
    </div>
  )
}


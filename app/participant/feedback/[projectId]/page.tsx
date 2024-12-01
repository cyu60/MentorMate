import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

async function getFeedback(projectId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedback:', error)
    return []
  }

  return data
}

export default async function FeedbackPage({ params }: { params: { projectId: string } }) {
  const projectData = await getProjectData(params.projectId)
  const feedback = await getFeedback(params.projectId)

  if (!projectData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Feedback for {projectData.project_name}</h1>
      <div className="mb-6">
        <Link href={`/participant/dashboard/${params.projectId}`}>
          <Button variant="outline">Back to Project Details</Button>
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        {feedback.length > 0 ? (
          <ul className="space-y-4">
            {feedback.map((item) => (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">{item.feedback_text}</p>
                <p className="text-sm text-gray-600 mt-2">- {item.mentor_name} ({item.mentor_email})</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No feedback received yet.</p>
        )}
      </div>
    </div>
  )
}


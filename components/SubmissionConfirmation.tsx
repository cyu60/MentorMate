import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function SubmissionConfirmation({ projectName }: { projectName: string }) {
  const router = useRouter()

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Feedback Submitted</h2>
      <p>Your feedback for {projectName} has been received. Thank you for your contribution!</p>
      <Button onClick={() => router.push('/mentor/scan')} className="mt-4">
        Scan Another Project
      </Button>
    </div>
  )
}


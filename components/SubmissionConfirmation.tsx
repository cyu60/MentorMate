import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function SubmissionConfirmation({ projectName }: { projectName: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center space-y-6">
      <h2 className="text-3xl font-bold text-blue-900">Feedback Submitted</h2>
      <p className="text-lg text-gray-700">
        Your feedback for <span className="font-semibold text-blue-700">{projectName}</span> has been received. Thank you for your contribution!
      </p>
      <Button
        onClick={() => router.push('/mentor/scan')}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
      >
        Scan Another Project
      </Button>
    </div>
  )
}

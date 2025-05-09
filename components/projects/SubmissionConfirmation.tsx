// import { Button } from "@/components/ui/button";

export function SubmissionConfirmation({
  projectName,
}: {
  projectName: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center space-y-6">
      <h2 className="text-3xl font-bold text-blue-900">Feedback Submitted</h2>
      <p className="text-lg text-gray-700">
        Your feedback for{" "}
        <span className="font-semibold text-blue-800">{projectName}</span> has
        been received. Thank you for your contribution!
      </p>
      {/* <Button
        onClick={() => router.push('/mentor/scan')}
        className="mt-6 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
      >
        Scan Another Project
      </Button> */}
    </div>
  );
}

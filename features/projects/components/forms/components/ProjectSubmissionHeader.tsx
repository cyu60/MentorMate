interface ProjectSubmissionHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function ProjectSubmissionHeader({ currentStep, totalSteps }: ProjectSubmissionHeaderProps) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-4xl font-extrabold text-gray-900">
        Submit Your Project
      </h2>
      <p className="mt-3 text-lg text-gray-600">
        Provide your project details for mentor feedback and get started on
        your journey.
      </p>
      <div className="mt-6">
        <p className="text-lg text-gray-700">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
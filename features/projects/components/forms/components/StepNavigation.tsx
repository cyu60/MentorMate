import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  canGoNext,
  onPrevious,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      )}
      
      <div className="ml-auto">
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSubmitting || !canGoNext}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
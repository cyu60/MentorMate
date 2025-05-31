import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  validationMessages?: string[];
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  canGoNext,
  validationMessages = [],
  onPrevious,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isLastStep = currentStep === totalSteps;
  const showTooltip = !canGoNext && validationMessages.length > 0;

  const NextButton = () => (
    <Button
      type="button"
      onClick={onNext}
      disabled={!canGoNext}
    >
      Next
    </Button>
  );

  const SubmitButton = () => (
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
  );

  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      )}
      
      <div className="ml-auto">
        <TooltipProvider>
          {showTooltip ? (
            <Tooltip open={isHovered}>
              <TooltipTrigger asChild>
                <div 
                  className="inline-block"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {isLastStep ? <SubmitButton /> : <NextButton />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-4">
                <div className="space-y-3">
                  <p className="font-semibold text-sm">Please fix the following issues:</p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    {validationMessages.map((message, index) => (
                      <li key={index} className="text-sm leading-relaxed">{message}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            isLastStep ? <SubmitButton /> : <NextButton />
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
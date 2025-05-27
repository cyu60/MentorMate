"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

// Imported schema and types
import { formSchema, ProjectSubmissionFormData } from "./schema/ProjectSubmissionSchema";

// Imported hooks
import { useProjectSubmissionData } from "./hooks/useProjectSubmissionData";
import { useStepNavigation } from "./hooks/useStepNavigation";
import { useStepValidation } from "./hooks/useStepValidation";

// Imported components
import { ProjectSubmissionHeader } from "./components/ProjectSubmissionHeader";
import { ProjectInfoStep } from "./steps/ProjectInfoStep";
import { ProjectDocumentationStep } from "./steps/ProjectDocumentationStep";
import { TeamContactStep } from "./steps/TeamContactStep";
import { StepNavigation } from "./components/StepNavigation";

export function ProjectSubmissionFormComponent({
  userEmail,
  leadName,
  eventId,
  onProjectSubmitted,
}: {
  userEmail?: string;
  leadName?: string;
  eventId: string;
  onProjectSubmitted?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Custom hooks
  const { allUsers, availableTracks, isLoading } = useProjectSubmissionData(eventId);
  const { currentStep, totalSteps, goToNext, goToPrevious, isLastStep } = useStepNavigation(3);
  
  // Form setup
  const form = useForm<ProjectSubmissionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      leadName: leadName || "",
      leadEmail: userEmail || "",
      projectDescription: "",
      teammates: [],
      projectUrl: "",
      trackIds: [],
    },
  });
  
  const { validateStep } = useStepValidation(form);

  // Auto-fill form when props change
  useEffect(() => {
    if (leadName) form.setValue("leadName", leadName);
    if (userEmail) form.setValue("leadEmail", userEmail);
  }, [leadName, userEmail, form]);

  // Handle teammates change
  const handleTeammatesChange = (tags: string[]) => {
    form.setValue("teammates", tags);
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      goToNext();
    }
  };

  const handlePrevious = () => {
    goToPrevious();
  };

  // Form submission - TODO: Extract to custom hook
  const onSubmit = async (values: ProjectSubmissionFormData) => {
    setIsSubmitting(true);
    // TODO: Move submission logic to useProjectSubmission hook
    console.log("Submitting:", values);
    setIsSubmitting(false);
  };

  // Determine if we can proceed to next step
  const canGoNext = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.projectName.trim().length >= 2 && 
               values.projectDescription.trim().length >= 10 && 
               values.trackIds.length > 0;
      case 2:
        return true; // Documentation step is optional
      case 3:
        return values.leadName.trim().length >= 2 && 
               values.leadEmail.trim().length > 0;
      default:
        return true;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white rounded-xl shadow-xl">
      <ProjectSubmissionHeader currentStep={currentStep} totalSteps={totalSteps} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {currentStep === 1 && (
            <ProjectInfoStep form={form} availableTracks={availableTracks} />
          )}
          
          {currentStep === 2 && (
            <ProjectDocumentationStep form={form} />
          )}
          
          {currentStep === 3 && (
            <TeamContactStep 
              form={form}
              allUsers={allUsers}
              leadName={leadName}
              userEmail={userEmail}
              onTeammatesChange={handleTeammatesChange}
            />
          )}
          
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isSubmitting={isSubmitting}
            canGoNext={canGoNext()}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={() => form.handleSubmit(onSubmit)()}
          />
        </form>
      </Form>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
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
import { toast } from "@/lib/hooks/use-toast";

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
  const { currentStep, totalSteps, goToNext, goToPrevious } = useStepNavigation(3);
  
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
      videoUrl: "",
      trackIds: [],
    },
  });
  
  const { validateStep, getStepValidationMessages } = useStepValidation(form);

  // Watch form fields that affect validation to trigger re-renders
  const projectNameValue = form.watch("projectName");
  const projectDescriptionValue = form.watch("projectDescription");
  const trackIdsValue = form.watch("trackIds");
  const leadNameValue = form.watch("leadName");
  const leadEmailValue = form.watch("leadEmail");
  const videoUrlValue = form.watch("videoUrl");

  // Determine if we can proceed to next step and get validation messages
  // Using useMemo with form values as dependencies to ensure re-calculation when form changes
  const getValidationState = useMemo(() => {
    const validationMessages = getStepValidationMessages(currentStep);
    const canGoNext = validationMessages.length === 0;
    return { canGoNext, validationMessages };
  }, [
    currentStep,
    getStepValidationMessages,
    projectNameValue,
    projectDescriptionValue,
    trackIdsValue,
    leadNameValue,
    leadEmailValue,
    videoUrlValue
  ]);

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
    if (values.trackIds.length === 0) {
      toast({
        title: "Missing Track Selection",
        description:
          "Please select at least one project track before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (values.projectName.trim().length < 2) {
      toast({
        title: "Invalid Project Name",
        description: "Project name must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (values.projectDescription.trim().length < 10) {
      toast({
        title: "Insufficient Project Description",
        description:
          "Please provide a more detailed project description (minimum 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let additionalMaterialsUrl = null;
      let coverImageUrl = null;

      // Upload cover image if provided
      if (values.coverImage && values.coverImage.length > 0) {
        const file = values.coverImage[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `project-covers/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("project-materials")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-materials").getPublicUrl(filePath);
        coverImageUrl = publicUrl;
      }

      // Upload additional materials if provided
      if (values.additionalMaterials && values.additionalMaterials.length > 0) {
        const file = values.additionalMaterials[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `project-materials/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("project-materials")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-materials").getPublicUrl(filePath);
        additionalMaterialsUrl = publicUrl;
      }

      // Submit project through API
      const response = await fetch("/api/projects/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: values.projectName,
          leadName: values.leadName,
          leadEmail: values.leadEmail,
          projectDescription: values.projectDescription,
          teammates: values.teammates,
          projectUrl: values.projectUrl,
          coverImageUrl,
          additionalMaterialsUrl,
          eventId,
          trackIds: values.trackIds,
          videoUrl: values.videoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit project");
      }

      const { data, warning } = await response.json();

      // Show warning if track assignments failed
      if (warning) {
        toast({
          title: "Warning",
          description: warning,
          variant: "destructive",
        });
      }

      // TODO: Re-enable email notifications once email system is stable
      // Send confirmation email
      // const emailResponse = await fetch("/api/email", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     type: "project_submission",
      //     to: values.leadEmail,
      //     projectName: values.projectName,
      //     leadName: values.leadName,
      //     teammates: values.teammates || [],
      //   }),
      // });
      // if (!emailResponse.ok) {
      //   console.error("Failed to send confirmation email");
      // }
      toast({
        title: "Project Submitted",
        description: "Your project has been submitted for feedback.",
      });
      form.reset();
      onProjectSubmitted?.();
      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { canGoNext, validationMessages } = getValidationState;

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
            canGoNext={canGoNext}
            validationMessages={validationMessages}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={() => form.handleSubmit(onSubmit)()}
          />
        </form>
      </Form>
    </div>
  );
}
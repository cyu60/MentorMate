import { UseFormReturn } from "react-hook-form";
import { toast } from "@/lib/hooks/use-toast";
import { ProjectSubmissionFormData } from "../schema/ProjectSubmissionSchema";

export function useStepValidation(form: UseFormReturn<ProjectSubmissionFormData>) {
  const validateStep = (step: number): boolean => {
    const values = form.getValues();

    switch (step) {
      case 1:
        if (values.projectName.trim().length < 2) {
          toast({
            title: "Invalid Project Name",
            description: "Project name must be at least 2 characters long.",
            variant: "destructive",
          });
          return false;
        }
        if (values.projectDescription.trim().length < 10) {
          toast({
            title: "Insufficient Project Description",
            description:
              "Please provide a more detailed project description (minimum 10 characters).",
            variant: "destructive",
          });
          return false;
        }
        if (values.trackIds.length === 0) {
          toast({
            title: "Missing Track Selection",
            description:
              "Please select at least one project track before proceeding.",
            variant: "destructive",
          });
          return false;
        }
        if (!values.videoUrl || values.videoUrl.trim().length === 0) {
          toast({
            title: "Missing Video Submission",
            description: "Video submission is required. Please provide a video URL.",
            variant: "destructive",
          });
          return false;
        }
        if (!/^https?:\/\/.+/.test(values.videoUrl)) {
          toast({
            title: "Invalid Video URL",
            description: "Please enter a valid video URL.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case 2:
        // Documentation step - no specific validation required
        return true;
      
      case 3:
        if (values.leadName.trim().length < 2) {
          toast({
            title: "Invalid Name",
            description: "Name must be at least 2 characters long.",
            variant: "destructive",
          });
          return false;
        }
        if (
          !values.leadEmail ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.leadEmail)
        ) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const getStepValidationMessages = (step: number): string[] => {
    const values = form.getValues();
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (values.projectName.trim().length < 2) {
          errors.push("Project name must be at least 2 characters long");
        }
        if (values.projectDescription.trim().length < 10) {
          errors.push("Project description must be at least 10 characters long");
        }
        if (values.trackIds.length === 0) {
          errors.push("Please select at least one project track");
        }
        if (!values.videoUrl || values.videoUrl.trim().length === 0) {
          errors.push("Video submission is required");
        }
        if (values.videoUrl && !/^https?:\/\/.+/.test(values.videoUrl)) {
          errors.push("Please enter a valid video URL");
        }
        break;
      
      case 2:
        // Documentation step - no specific validation required
        break;
      
      case 3:
        if (values.leadName.trim().length < 2) {
          errors.push("Name must be at least 2 characters long");
        }
        if (
          !values.leadEmail ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.leadEmail)
        ) {
          errors.push("Please enter a valid email address");
        }
        break;
    }

    return errors;
  };

  return { validateStep, getStepValidationMessages };
}
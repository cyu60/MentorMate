import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { FileUploadField } from "../components/FileUploadField";
import { ProjectSubmissionFormData } from "../schema/ProjectSubmissionSchema";

interface ProjectDocumentationStepProps {
  form: UseFormReturn<ProjectSubmissionFormData>;
}

export function ProjectDocumentationStep({ form }: ProjectDocumentationStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="coverImage"
        render={({ field: { onChange, name, onBlur, ref } }) => (
          <FileUploadField
            name={name}
            label="Cover Image (Optional)"
            description="Upload a cover image (max 10MB)"
            accept="image/*"
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
          />
        )}
      />
      
      <FormField
        control={form.control}
        name="additionalMaterials"
        render={({ field: { onChange, name, onBlur, ref } }) => (
          <FileUploadField
            name={name}
            label="Additional Materials (Optional)"
            description="Upload additional documentation or materials (max 10MB)"
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
          />
        )}
      />
    </div>
  );
}
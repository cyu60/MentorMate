import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrackSelector } from "../components/TrackSelector";
import { ProjectSubmissionFormData } from "../schema/ProjectSubmissionSchema";

interface Track {
  id: string;
  name: string;
}

interface ProjectInfoStepProps {
  form: UseFormReturn<ProjectSubmissionFormData>;
  availableTracks: Track[];
}

export function ProjectInfoStep({ form, availableTracks }: ProjectInfoStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Project Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter project name"
                {...field}
                className="text-base p-3"
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="projectDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Project Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Briefly describe your project..."
                className="resize-none text-base p-3 min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-sm">
              Provide an overview of your project (max 500 characters).
            </FormDescription>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="trackIds"
        render={({ field }) => (
          <TrackSelector
            tracks={availableTracks}
            selectedTrackIds={field.value}
            onChange={field.onChange}
          />
        )}
      />
      
      <FormField
        control={form.control}
        name="projectUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">
              GitHub Repository (Optional)
            </FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://github.com/username/repository"
                {...field}
                className="text-base p-3"
              />
            </FormControl>
            <FormDescription className="text-sm">
              Link to your project&apos;s repository.
            </FormDescription>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
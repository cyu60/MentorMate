"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import UserSearch from "@/components/utils/UserSearch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { UUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formSchema = z.object({
  projectName: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  leadName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  leadEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  projectDescription: z
    .string()
    .min(10, {
      message: "Project description must be at least 10 characters.",
    })
    .max(500, {
      message: "Project description must not exceed 500 characters.",
    }),
  teammates: z.array(z.string()).optional(),
  projectUrl: z.string().url().optional().or(z.literal("")),
  trackIds: z.array(z.string()).min(1, {
    message: "Please select at least one track.",
  }),
  coverImage: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      {
        message: "File size must be less than 10MB",
      }
    ),
  additionalMaterials: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      {
        message: "File size must be less than 10MB",
      }
    ),
});

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(
    null
  );
  const [availableTracks, setAvailableTracks] = useState<
    { id: string; name: string }[]
  >([]);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<z.infer<typeof formSchema>>({
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

  useEffect(() => {
    if (leadName) form.setValue("leadName", leadName);
    if (userEmail) form.setValue("leadEmail", userEmail);
  }, [leadName, userEmail, form]);

  const [allUsers, setAllUsers] = useState<string[]>([]);
  useEffect(() => {
    const fetchUserDisplayNames = async () => {
      try {
        const { data, error } = await supabase
          .from("user_event_roles")
          .select("user_id, user_profiles!user_id(email)")
          .eq("role", "participant")
          .eq("event_id", eventId)
          .overrideTypes<
            Array<{
              user_id: UUID;
              user_profiles: {
                email: string;
              };
            }>
          >();

        if (error) {
          console.error("Error fetching user display names:", error);
          return;
        }
        if (data) {
          const emails = data.map((user) => user.user_profiles.email);
          setAllUsers(emails);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };
    fetchUserDisplayNames();
  }, [eventId]);

  // Fetch available tracks from event config
  useEffect(() => {
    const fetchEventTracks = async () => {
      try {
        const { data: trackData, error } = await supabase
          .from("event_tracks")
          .select("track_id, name")
          .eq("event_id", eventId);

        if (error) {
          console.error("Error fetching event tracks:", error);
          return;
        }

        if (trackData) {
          const tracks = trackData.map((track) => ({
            id: track.track_id,
            name: track.name,
          }));
          setAvailableTracks(tracks);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };
    fetchEventTracks();
  }, [eventId]);

  const handleTeammatesChange = (tags: string[]) => {
    form.setValue("teammates", tags);
  };

  // const isStepComplete = (step: number): boolean => {
  //   const values = form.getValues();
  //   switch (step) {
  //     case 1:
  //       return (
  //         values.projectName.trim().length >= 2 &&
  //         values.projectDescription.trim().length >= 10
  //       );
  //     case 2:
  //       // Check that both file inputs have at least one file uploaded
  //       return (
  //         (values.coverImage?.length ?? 0) > 0 &&
  //         (values.additionalMaterials?.length ?? 0) > 0
  //       );
  //     case 3:
  //       return (
  //         values.leadName.trim().length >= 2 &&
  //         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.leadEmail)
  //       );
  //     default:
  //       return false;
  //   }
  // };

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      // Send confirmation email
      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project_submission",
          to: values.leadEmail,
          projectName: values.projectName,
          leadName: values.leadName,
          teammates: values.teammates || [],
        }),
      });
      if (!emailResponse.ok) {
        console.error("Failed to send confirmation email");
      }
      toast({
        title: "Project Submitted",
        description: "Your project has been submitted for feedback.",
      });
      form.reset();
      onProjectSubmitted?.();
      router.push(`/my-project-gallery/${data.id}/dashboard`);
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
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white rounded-xl shadow-xl">
      {/* Header & Progress Indicator */}
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Project Info */}
          {currentStep === 1 && (
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
                    <FormLabel className="text-base">
                      Project Description
                    </FormLabel>
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
                  <FormItem>
                    <FormLabel className="text-base">Project Tracks</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {availableTracks.map((track) => (
                          <label
                            key={track.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={field.value.includes(track.id)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, track.id]
                                  : field.value.filter((id) => id !== track.id);
                                field.onChange(newValue);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {track.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm">
                      Select the tracks your project will participate in.
                    </FormDescription>
                    <FormMessage className="text-sm" />
                  </FormItem>
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
          )}

          {/* Step 2: Documentation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field: { onChange, name, onBlur, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Cover Image (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          name={name}
                          ref={ref}
                          onBlur={onBlur}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setSelectedCoverImage(files[0]);
                              onChange(files);
                            }
                          }}
                          accept="image/*"
                          className="flex-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {selectedCoverImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedCoverImage(null);
                              onChange(undefined);
                              const fileInput = document.querySelector(
                                `input[name="${name}"]`
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = "";
                              }
                            }}
                            className="px-2 py-1"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm">
                      Upload a cover image (max 10MB)
                    </FormDescription>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalMaterials"
                render={({ field: { onChange, name, onBlur, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Additional Materials (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          name={name}
                          ref={ref}
                          onBlur={onBlur}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setSelectedFile(files[0]);
                              onChange(files);
                            }
                          }}
                          accept=".pdf,.ppt,.pptx,.doc,.docx"
                          className="flex-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              onChange(undefined);
                              const fileInput = document.querySelector(
                                `input[name="${name}"]`
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = "";
                              }
                            }}
                            className="px-2 py-1"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm">
                      Upload pitch deck or other materials (max 10MB)
                    </FormDescription>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Team & Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="leadName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        Name
                        {leadName && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Auto-filled
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className={`text-base p-3 ${
                            leadName ? "bg-gray-100" : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        Email
                        {userEmail && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Auto-filled
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="johndoe@example.com"
                          {...field}
                          className={`text-base p-3 ${
                            userEmail ? "bg-gray-100" : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="teammates"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base">Teammates</FormLabel>
                    <FormControl>
                      <UserSearch
                        allTags={allUsers}
                        onTagsChange={handleTeammatesChange}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2"
              >
                Previous
              </Button>
            )}
            {currentStep < totalSteps && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2"
              >
                Next
              </Button>
            )}
            {currentStep === totalSteps && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Project"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

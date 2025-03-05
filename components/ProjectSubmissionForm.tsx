"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import UserSearch from "@/components/UserSearch";
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
  additionalMaterials: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      {
        message: "File size must be less than 10MB",
      }
    ),
  backgroundImage: z
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
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      leadName: leadName || "",
      leadEmail: userEmail || "",
      projectDescription: "",
      teammates: [],
      projectUrl: "",
    },
  });

  // Update form when props change
  useEffect(() => {
    if (leadName) {
      form.setValue('leadName', leadName);
    }
    if (userEmail) {
      form.setValue('leadEmail', userEmail);
    }
  }, [leadName, userEmail, form]);

  const [allUsers, setAllUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserDisplayNames = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name");

        if (error) {
          console.error("Error fetching user display names:", error);
          return;
        }

        if (data) {
          const displayNames = data.map((user) => user["display_name"]);
          console.log("Fetched display names:", displayNames);
          setAllUsers(displayNames);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchUserDisplayNames();
  }, []);

  const handleTeammatesChange = (tags: string[]) => {
    form.setValue("teammates", tags);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      let additionalMaterialsUrl = null;
      let backgroundImageUrl = null;

      // Upload additional materials if provided
      if (values.additionalMaterials && values.additionalMaterials.length > 0) {
        const file = values.additionalMaterials[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `project-materials/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-materials')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-materials')
          .getPublicUrl(filePath);

        additionalMaterialsUrl = publicUrl;
      }

      // Upload background image if provided
      if (values.backgroundImage && values.backgroundImage.length > 0) {
        const file = values.backgroundImage[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `project-backgrounds/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-materials')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-materials')
          .getPublicUrl(filePath);

        backgroundImageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          project_name: values.projectName,
          lead_name: values.leadName,
          lead_email: values.leadEmail,
          project_description: values.projectDescription,
          teammates: values.teammates,
          project_url: values.projectUrl || null,
          additional_materials_url: additionalMaterialsUrl,
          background_image_url: backgroundImageUrl,
          event_id: eventId,
        })
        .select();

      if (error) {
        console.error("Project creation error:", error);
        throw error;
      }

      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project_submission',
          to: values.leadEmail,
          projectName: values.projectName,
          leadName: values.leadName,
          teammates: values.teammates || [],
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send confirmation email');
      }

      toast({
        title: "Project Submitted",
        description: "Your project has been submitted for feedback.",
      });
      form.reset();

      onProjectSubmitted?.();
      router.push(`/events/${eventId}/projects/public/${data[0].id}`);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description:
          "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto sm:px-6 space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">Submit Your Project</h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Enter your project details for mentor feedback.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Project Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    {...field}
                    className="text-sm sm:text-base p-2 sm:p-3"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-medium">Submitted by:</h3>
            <div className="pl-4 space-y-4">
              <FormField
                control={form.control}
                name="leadName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base flex items-center gap-2">
                      Name
                      {leadName && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Auto-filled
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className={`text-sm sm:text-base p-2 sm:p-3 ${
                          leadName ? 'bg-muted/50' : ''
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leadEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base flex items-center gap-2">
                      Email
                      {userEmail && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Auto-filled
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="johndoe@example.com"
                        {...field}
                        className={`text-sm sm:text-base p-2 sm:p-3 ${
                          userEmail ? 'bg-muted/50' : ''
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Project Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe your project..."
                    className="resize-none text-sm sm:text-base p-2 sm:p-3 min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Provide a concise overview of your project (max 500
                  characters).
                </FormDescription>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Project URL (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Github/Devpost"
                    {...field}
                    className="text-sm sm:text-base p-2 sm:p-3"
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  GitHub repository or Devpost submission URL
                </FormDescription>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="backgroundImage"
            render={({ field: { onChange, name, onBlur, ref } }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Project Background Image (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      name={name}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setSelectedBackgroundImage(files[0]);
                          onChange(files);
                        }
                      }}
                      accept="image/*"
                      className="flex-1 text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedBackgroundImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedBackgroundImage(null);
                          onChange(undefined);
                          const fileInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.value = '';
                          }
                        }}
                        className="px-2 py-1"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Upload an image to be used as your project&apos;s background (max 10MB)
                </FormDescription>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalMaterials"
            render={({ field: { onChange, name, onBlur, ref } }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Additional Materials (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
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
                      className="flex-1 text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          onChange(undefined);
                          const fileInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.value = '';
                          }
                        }}
                        className="px-2 py-1"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Upload pitch deck or other project materials (max 10MB)
                </FormDescription>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teammates"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Teammates
                </FormLabel>
                <FormControl>
                  <UserSearch
                    allTags={allUsers}
                    onTagsChange={handleTeammatesChange}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full text-sm sm:text-base py-2 sm:py-3"
            disabled={isSubmitting}
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
        </form>
      </Form>
    </div>
  );
}

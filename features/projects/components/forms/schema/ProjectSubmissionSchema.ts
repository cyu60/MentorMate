import * as z from "zod";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const formSchema = z.object({
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
  videoUrl: z.string().url({
    message: "Please enter a valid video URL.",
  }).min(1, {
    message: "Video submission is required.",
  }),
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

export type ProjectSubmissionFormData = z.infer<typeof formSchema>;
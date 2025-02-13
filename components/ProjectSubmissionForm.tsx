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

const formSchema = z.object({
  projectName: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  leadName: z.string().min(2, {
    message: "Lead name must be at least 2 characters.",
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
});

export function ProjectSubmissionFormComponent({
  userEmail,
  leadName,
}: {
  userEmail?: string;
  leadName?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      leadName: leadName || "",
      leadEmail: userEmail || "",
      projectDescription: "",
      teammates: [],
    },
  });

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
      const { data, error } = await supabase
        .from("projects")
        .insert({
          project_name: values.projectName,
          lead_name: values.leadName,
          lead_email: values.leadEmail,
          project_description: values.projectDescription,
          teammates: values.teammates,
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

      router.push(`/participant/dashboard/${data[0].id}`);
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
        <h2 className="text-2xl sm:text-3xl font-bold">Submit Your Project</h2>
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
          <FormField
            control={form.control}
            name="leadName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Project Lead Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="text-sm sm:text-base p-2 sm:p-3"
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
                <FormLabel className="text-sm sm:text-base">
                  Project Lead Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="johndoe@example.com"
                    {...field}
                    className="text-sm sm:text-base p-2 sm:p-3"
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
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

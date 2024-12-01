"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from 'lucide-react';

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
});

export function ProjectSubmissionFormComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      leadName: "",
      leadEmail: "",
      projectDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          project_name: values.projectName,
          lead_name: values.leadName,
          lead_email: values.leadEmail,
          project_description: values.projectDescription
        })
        .select()

      if (error) throw error;

      // Store project data in local storage
      localStorage.setItem(`project_${data[0].id}`, JSON.stringify(data[0]))

      toast({
        title: "Project Submitted",
        description: "Your project has been submitted for feedback.",
      });
      form.reset();
      
      // Trigger a re-render of the participant page
      router.refresh();
      
      // Navigate to the project dashboard
      router.push(`/participant/dashboard/${data[0].id}`);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Submit Your Project</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your project details for mentor feedback.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Lead Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Lead Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="johndoe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe your project..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a concise overview of your project (max 500
                  characters).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
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


//TODO: fix this page based on the event schema and the roles information
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, EventItem, FeedbackItem } from "@/lib/types";

interface AdminDashboardProps {
  event?: EventItem;
}

interface MentorType {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface ExtendedFeedback extends FeedbackItem {
  project_name: string;
  project_description: string;
}

export function AdminDashboard({ event }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mentors, setMentors] = useState<MentorType[]>([]);
  const [feedback, setFeedback] = useState<ExtendedFeedback[]>([]);

  const fetchProjects = useCallback(async () => {
    const query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (event) {
      query.eq("event_id", event.event_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
  }, [event]);

  const fetchMentors = useCallback(async () => {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mentors:", error);
    } else {
      setMentors(data || []);
    }
  }, []);

  const fetchFeedbackWithProjects = useCallback(async () => {
    const query = supabase
      .from("feedback")
      .select(
        `
        *,
        projects:project_id (
          project_name,
          project_description
        )
      `
      )
      .order("created_at", { ascending: false });

    if (event) {
      query.eq("projects.event_id", event.event_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching feedback:", error);
    } else {
      const formattedData =
        data?.map((item) => ({
          ...item,
          project_name: item.projects.project_name,
          project_description: item.projects.project_description,
        })) || [];
      setFeedback(formattedData);
    }
  }, [event]);

  useEffect(() => {
    fetchProjects();
    fetchMentors();
    fetchFeedbackWithProjects();
  }, [fetchProjects, fetchMentors, fetchFeedbackWithProjects]);

  return (
    <Tabs defaultValue="projects" className="space-y-4">
      <TabsList>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="mentors">Mentors</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="projects">
        <h2 className="text-2xl font-bold mb-4">
          {event ? `Projects for ${event.event_name}` : "All Projects"}
        </h2>
        <Table>
          <TableCaption>
            A list of {event ? "event" : "all"} projects.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Lead Name</TableHead>
              <TableHead>Lead Email</TableHead>
              <TableHead>Project Description</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.project_name}</TableCell>
                <TableCell>{project.lead_name}</TableCell>
                <TableCell>{project.lead_email}</TableCell>
                <TableCell>{project.project_description}</TableCell>
                <TableCell>
                  {new Date(project.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="mentors">
        <h2 className="text-2xl font-bold mb-4">All Mentors</h2>
        <Table>
          <TableCaption>A list of all registered mentors.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentors.map((mentor) => (
              <TableRow key={mentor.id}>
                <TableCell>{mentor.name}</TableCell>
                <TableCell>{mentor.email}</TableCell>
                <TableCell>
                  {new Date(mentor.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="feedback">
        <h2 className="text-2xl font-bold mb-4">
          {event ? `Feedback for ${event.event_name}` : "All Feedback"}
        </h2>
        <Table>
          <TableCaption>
            A list of {event ? "event" : "all"} feedback.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Project Description</TableHead>
              <TableHead>Mentor Name</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.project_name}</TableCell>
                <TableCell>{item.project_description}</TableCell>
                <TableCell>{item.mentor_name}</TableCell>
                <TableCell>{item.feedback_text}</TableCell>
                <TableCell>{item.rating}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}

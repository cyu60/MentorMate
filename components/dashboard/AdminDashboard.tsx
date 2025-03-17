'use client'

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  created_at: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface FeedbackWithProject {
  id: string;
  project_id: string;
  project_name: string;
  project_description: string;
  mentor_id: string;
  mentor_name: string;
  mentor_email: string;
  feedback_text: string;
  created_at: string;
}

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [feedback, setFeedback] = useState<FeedbackWithProject[]>([])

  useEffect(() => {
    fetchProjects()
    fetchMentors()
    fetchFeedbackWithProjects()
  }, [])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
  }

  async function fetchMentors() {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mentors:', error)
    } else {
      setMentors(data || [])
    }
  }

  async function fetchFeedbackWithProjects() {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        projects:project_id (
          project_name,
          project_description
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching feedback:', error)
    } else {
      const formattedData = data?.map(item => ({
        ...item,
        project_name: item.projects.project_name,
        project_description: item.projects.project_description
      })) || []
      setFeedback(formattedData)
    }
  }

  return (
    <Tabs defaultValue="projects" className="space-y-4">
      <TabsList>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="mentors">Mentors</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="projects">
        <h2 className="text-2xl font-bold mb-4">All Projects</h2>
        <Table>
          <TableCaption>A list of all submitted projects.</TableCaption>
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
                <TableCell>{new Date(project.created_at).toLocaleString()}</TableCell>
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
                <TableCell>{new Date(mentor.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="feedback">
        <h2 className="text-2xl font-bold mb-4">All Feedback</h2>
        <Table>
          <TableCaption>A list of all submitted feedback.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Project Description</TableHead>
              <TableHead>Mentor Name</TableHead>
              <TableHead>Mentor Email</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.project_name}</TableCell>
                <TableCell>{item.project_description}</TableCell>
                <TableCell>{item.mentor_name}</TableCell>
                <TableCell>{item.mentor_email}</TableCell>
                <TableCell>{item.feedback_text}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}


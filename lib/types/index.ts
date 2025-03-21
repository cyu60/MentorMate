// Core Event Types
export type EventItem = {
  event_id: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url?: string;
};

// Event Overview Types
export interface ScheduleEvent {
  name: string;
  time: string;
}

export interface ScheduleDay {
  time: string;
  events: ScheduleEvent[];
}

export interface Prize {
  track: string;
  prize: string;
  description: string;
}

export interface Resource {
  name: string;
  link: string;
}

export interface Rule {
  title: string;
  items: string[];
}

export interface EventDetails extends EventItem {
  event_description: string;
  event_schedule: ScheduleDay[];
  event_prizes: Prize[];
  event_resources: Resource[];
  created_at: string;
  rules: Rule[];
}

// Project Types
export interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates?: string[];
  event_id: string;
  created_at: string;
  project_url?: string;
  additional_materials_url?: string;
  cover_image_url?: string;
}

export enum ProjectBoardContext {
  MyProjects = "MyProjects",
  EventGallery = "EventGallery"
}

// Feedback Types
export interface FeedbackItem {
  id: string;
  project_id: string;
  mentor_name: string;
  mentor_email?: string;
  feedback_text: string;
  rating: number;
  created_at: string;
} 
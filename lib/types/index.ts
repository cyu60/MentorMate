// Core Event Types
export enum EventRole {
  Participant = "participant",
  Mentor = "mentor",
  Judge = "judge",
  Organizer = "organizer",
  Admin = "admin",
}

export enum EventVisibility {
  Test = "test",
  Demo = "demo",
  Private = "private",
  Public = "public",
  Draft = "draft",
}

export enum JudgingMode {
  Traditional = "traditional",
  Investment = "investment",
  // Future modes can be added here
  // PeerReview = "peer_review",
  // Qualitative = "qualitative",
}

export interface UserProfile {
  uid: string;
  display_name: string;
}

export type EventItem = {
  event_id: string;
  event_name: string;
  event_date: string;
  location: string;
  visibility?: EventVisibility;
  cover_image_url?: string;
  scoring_config?: EventScoringConfig;
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
  id: string;
  prize_amount: string;
  prize_description: string;
}

export interface Resource {
  name: string;
  link: string;
}

export interface Rule {
  title: string;
  items: string[];
}

export interface EventTrack {
  track_id: string;
  event_id: string;
  name: string;
  description: string;
  label?: string;
  prizes?: Prize[];
  scoring_criteria: TrackScoringConfig;
  judging_mode?: JudgingMode;
  created_at: string;
  updated_at: string;
}

export interface EventDetails extends EventItem {
  event_description: string;
  event_blurb?: string;
  event_schedule: ScheduleDay[];
  event_prizes: Prize[];
  event_resources: Resource[];
  created_at: string;
  rules: Rule[];
  event_tracks?: EventTrack[];
  role_labels?: Record<string, string>;
  judging_mode?: "traditional" | "investment";
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
  track_ids: string[];
  tracks?: EventTrack[];
  created_at: string;
  project_url?: string;
  additional_materials_url?: string;
  cover_image_url?: string;
  event_name?: string;
}

export enum ProjectBoardContext {
  MyProjects = "MyProjects",
  EventGallery = "EventGallery",
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

// Scoring Types
export interface ScoringCriterion {
  id: string;
  name: string;
  description: string;
  weight?: number;
  min?: number;
  max?: number;
  type?: "numeric" | "choice" | "scale" | "multiplechoice" | "likert"; // Type of criterion
  options?: string[]; // Options for choice-based criteria
  likertScale?: number; // Number of points on the Likert scale (usually 5 or 7)
}

export interface TrackScoringConfig {
  name: string;
  criteria: ScoringCriterion[];
}

export interface EventScoringConfig {
  tracks: Record<string, TrackScoringConfig>;
  defaultMin?: number;
  defaultMax?: number;
  defaultWeight?: number;
}

export interface ProjectScore {
  id: string;
  project_id: string;
  judge_id: string;
  track_id: string;
  event_id: string;
  scores: Record<string, number | string>;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreFormData {
  scores: Record<string, number | string>;
  comments?: string;
}

// Add new type for project-track relationship
export interface ProjectTrack {
  project_id: string;
  track_id: string;
  created_at: string;
}

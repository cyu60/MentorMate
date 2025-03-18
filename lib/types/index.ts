export interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  teammates: string[];
  project_url?: string | null;
  additional_materials_url?: string | null;
  cover_image_url?: string | null;
  event_id: string;
  event_name?: string;
}

export interface FeedbackItem {
  id: string;
  project_id: string;
  mentor_name: string;
  mentor_email?: string;
  feedback_text: string;
  rating: number;
  created_at: string;
} 
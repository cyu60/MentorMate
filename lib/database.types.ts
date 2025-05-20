export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_event_roles: {
        Row: {
          user_id: string
          event_id: string
          role: "participant" | "mentor" | "judge" | "organizer" | "admin"
          created_at: string
          users: {
            email: string | null
            full_name: string | null
          }
        }
        Insert: {
          user_id: string
          event_id: string
          role: "participant" | "mentor" | "judge" | "organizer" | "admin"
          created_at?: string
        }
        Update: {
          user_id?: string
          event_id?: string
          role?: "participant" | "mentor" | "judge" | "organizer" | "admin"
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          project_name: string
          lead_name: string
          lead_email: string
          project_description: string
          teammates: string[]
          project_url: string | null
          additional_materials_url: string | null
          cover_image_url: string | null
          event_id: string
          created_at: string
        }
      }
      project_scores: {
        Row: {
          id: string
          project_id: string
          judge_id: string
          track_id: string
          event_id: string
          scores: Record<string, number | string>
          comments: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
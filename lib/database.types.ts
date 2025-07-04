export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_tracks: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          label: string | null
          name: string
          prize_amount: string | null
          prize_description: string | null
          scoring_criteria: Json | null
          track_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          label?: string | null
          name: string
          prize_amount?: string | null
          prize_description?: string | null
          scoring_criteria?: Json | null
          track_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          label?: string | null
          name?: string
          prize_amount?: string | null
          prize_description?: string | null
          scoring_criteria?: Json | null
          track_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tracks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          event_blurb: string | null
          event_date: string
          event_description: string | null
          event_id: string
          event_name: string
          event_prizes: Json | null
          event_resources: Json | null
          event_schedule: Json | null
          location: string | null
          role_labels: Json | null
          rules: Json
          scoring_config: Json | null
          slug: string | null
          submission_time_cutoff: string | null
          submission_time_start: string | null
          visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          event_blurb?: string | null
          event_date: string
          event_description?: string | null
          event_id?: string
          event_name: string
          event_prizes?: Json | null
          event_resources?: Json | null
          event_schedule?: Json | null
          location?: string | null
          role_labels?: Json | null
          rules: Json
          scoring_config?: Json | null
          slug?: string | null
          submission_time_cutoff?: string | null
          submission_time_start?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          event_blurb?: string | null
          event_date?: string
          event_description?: string | null
          event_id?: string
          event_name?: string
          event_prizes?: Json | null
          event_resources?: Json | null
          event_schedule?: Json | null
          location?: string | null
          role_labels?: Json | null
          rules?: Json
          scoring_config?: Json | null
          slug?: string | null
          submission_time_cutoff?: string | null
          submission_time_start?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Relationships: []
      }
      feedback: {
        Row: {
          actionable_ai_suggestion: string | null
          created_at: string | null
          event_id: string | null
          feedback_text: string | null
          id: string
          mentor_email: string | null
          mentor_id: string | null
          mentor_name: string | null
          modifier_field: string[] | null
          original_feedback_text: string | null
          positive_ai_suggestion: string | null
          project_id: string | null
          specific_ai_suggestion: string | null
        }
        Insert: {
          actionable_ai_suggestion?: string | null
          created_at?: string | null
          event_id?: string | null
          feedback_text?: string | null
          id?: string
          mentor_email?: string | null
          mentor_id?: string | null
          mentor_name?: string | null
          modifier_field?: string[] | null
          original_feedback_text?: string | null
          positive_ai_suggestion?: string | null
          project_id?: string | null
          specific_ai_suggestion?: string | null
        }
        Update: {
          actionable_ai_suggestion?: string | null
          created_at?: string | null
          event_id?: string | null
          feedback_text?: string | null
          id?: string
          mentor_email?: string | null
          mentor_id?: string | null
          mentor_name?: string | null
          modifier_field?: string[] | null
          original_feedback_text?: string | null
          positive_ai_suggestion?: string | null
          project_id?: string | null
          specific_ai_suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      platform_engagement: {
        Row: {
          content: string
          created_at: string | null
          display_name: string | null
          event_id: string
          id: string
          is_private: boolean | null
          status: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          display_name?: string | null
          event_id: string
          id?: string
          is_private?: boolean | null
          status?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          display_name?: string | null
          event_id?: string
          id?: string
          is_private?: boolean | null
          status?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_engagement_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      prizes: {
        Row: {
          created_at: string | null
          id: string
          prize_amount: string
          prize_description: string
          track_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prize_amount: string
          prize_description: string
          track_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prize_amount?: string
          prize_description?: string
          track_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prizes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "event_tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      project_scores: {
        Row: {
          comments: string | null
          created_at: string | null
          event_id: string | null
          id: string
          judge_id: string
          project_id: string
          scores: Json
          track_id: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          judge_id: string
          project_id: string
          scores: Json
          track_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          judge_id?: string
          project_id?: string
          scores?: Json
          track_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_id"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "fk_project_scores_track"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "event_tracks"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "project_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tracks: {
        Row: {
          created_at: string | null
          project_id: string
          track_id: string
        }
        Insert: {
          created_at?: string | null
          project_id: string
          track_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "event_tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      projects: {
        Row: {
          additional_materials_url: string | null
          cover_image_url: string | null
          created_at: string | null
          event_id: string | null
          id: string
          lead_email: string | null
          lead_name: string
          project_description: string | null
          project_name: string | null
          project_url: string | null
          teammates: string[] | null
        }
        Insert: {
          additional_materials_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          lead_email?: string | null
          lead_name: string
          project_description?: string | null
          project_name?: string | null
          project_url?: string | null
          teammates?: string[] | null
        }
        Update: {
          additional_materials_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          lead_email?: string | null
          lead_name?: string
          project_description?: string | null
          project_name?: string | null
          project_url?: string | null
          teammates?: string[] | null
        }
        Relationships: []
      }
      role_passwords: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          password_hash: string
          role: Database["public"]["Enums"]["event_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          password_hash: string
          role: Database["public"]["Enums"]["event_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["event_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_passwords_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      user_event_roles: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          role: Database["public"]["Enums"]["event_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          role: Database["public"]["Enums"]["event_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          role?: Database["public"]["Enums"]["event_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "user_event_roles_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["uid"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          links: Json | null
          pulse: number
          uid: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          links?: Json | null
          pulse?: number
          uid: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          links?: Json | null
          pulse?: number
          uid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_pulse: {
        Args: { userId: string }
        Returns: undefined
      }
      insert: {
        Args: {
          display_name: string
          email: string
          uid: string
          full_name: string
        }
        Returns: undefined
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      migrate_tracks_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      event_role:
        | "participant"
        | "mentor"
        | "judge"
        | "organizer"
        | "admin"
        | "event"
      event_visibility: "test" | "demo" | "private" | "public" | "draft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_role: [
        "participant",
        "mentor",
        "judge",
        "organizer",
        "admin",
        "event",
      ],
      event_visibility: ["test", "demo", "private", "public", "draft"],
    },
  },
} as const

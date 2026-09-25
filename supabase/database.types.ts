export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: number
          organization_id: string | null
          payload: Json
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: never
          organization_id?: string | null
          payload?: Json
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: never
          organization_id?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          canonical_domain: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          normalized_name: string | null
          organization_type: string
          phone: string | null
          postal_code: string | null
          state_region: string | null
          street_address: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          canonical_domain?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          normalized_name?: string | null
          organization_type: string
          phone?: string | null
          postal_code?: string | null
          state_region?: string | null
          street_address?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          canonical_domain?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string | null
          organization_type?: string
          phone?: string | null
          postal_code?: string | null
          state_region?: string | null
          street_address?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rubric_versions: {
        Row: {
          active_from: string
          config: Json
          created_at: string
          id: string
          name: string
          retired_at: string | null
          screening_type: string
          version: string
        }
        Insert: {
          active_from?: string
          config?: Json
          created_at?: string
          id?: string
          name: string
          retired_at?: string | null
          screening_type: string
          version: string
        }
        Update: {
          active_from?: string
          config?: Json
          created_at?: string
          id?: string
          name?: string
          retired_at?: string | null
          screening_type?: string
          version?: string
        }
        Relationships: []
      }
      screening_findings: {
        Row: {
          category_key: string
          confidence: number | null
          created_at: string
          explanation: string | null
          finding_type: string
          id: string
          max_score: number
          raw_value: Json
          rule_key: string
          score: number
          screening_run_id: string
          source_id: string | null
        }
        Insert: {
          category_key: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          finding_type: string
          id?: string
          max_score: number
          raw_value?: Json
          rule_key: string
          score?: number
          screening_run_id: string
          source_id?: string | null
        }
        Update: {
          category_key?: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          finding_type?: string
          id?: string
          max_score?: number
          raw_value?: Json
          rule_key?: string
          score?: number
          screening_run_id?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_findings_screening_run_id_fkey"
            columns: ["screening_run_id"]
            isOneToOne: false
            referencedRelation: "screening_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_findings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "screening_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_reports: {
        Row: {
          created_at: string
          id: string
          planning_target: number | null
          report_snapshot: Json
          screening_run_id: string
          total_score: number
        }
        Insert: {
          created_at?: string
          id?: string
          planning_target?: number | null
          report_snapshot?: Json
          screening_run_id: string
          total_score: number
        }
        Update: {
          created_at?: string
          id?: string
          planning_target?: number | null
          report_snapshot?: Json
          screening_run_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "screening_reports_screening_run_id_fkey"
            columns: ["screening_run_id"]
            isOneToOne: true
            referencedRelation: "screening_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_responses: {
        Row: {
          created_at: string
          id: string
          question_key: string
          response: Json
          screening_run_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_key: string
          response?: Json
          screening_run_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_key?: string
          response?: Json
          screening_run_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_responses_screening_run_id_fkey"
            columns: ["screening_run_id"]
            isOneToOne: false
            referencedRelation: "screening_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_runs: {
        Row: {
          canonical_identity_snapshot: Json
          completed_at: string | null
          created_at: string
          id: string
          initiated_by: string | null
          input_snapshot: Json
          organization_id: string
          rubric_version_id: string
          screening_type: string
          started_at: string
          status: string
        }
        Insert: {
          canonical_identity_snapshot?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          input_snapshot?: Json
          organization_id: string
          rubric_version_id: string
          screening_type: string
          started_at?: string
          status?: string
        }
        Update: {
          canonical_identity_snapshot?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string | null
          input_snapshot?: Json
          organization_id?: string
          rubric_version_id?: string
          screening_type?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_runs_rubric_version_id_fkey"
            columns: ["rubric_version_id"]
            isOneToOne: false
            referencedRelation: "rubric_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_sources: {
        Row: {
          confidence: number | null
          created_at: string
          excluded_reason: string | null
          fetched_at: string
          field_differences: Json
          id: string
          identity_conflicts: Json
          included_in_score: boolean
          match_basis: Json
          match_status: string
          observed_address: string | null
          observed_city: string | null
          observed_domain: string | null
          observed_name: string | null
          observed_phone: string | null
          observed_postal_code: string | null
          observed_state: string | null
          screening_run_id: string
          source_type: string
          source_url: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          excluded_reason?: string | null
          fetched_at?: string
          field_differences?: Json
          id?: string
          identity_conflicts?: Json
          included_in_score?: boolean
          match_basis?: Json
          match_status: string
          observed_address?: string | null
          observed_city?: string | null
          observed_domain?: string | null
          observed_name?: string | null
          observed_phone?: string | null
          observed_postal_code?: string | null
          observed_state?: string | null
          screening_run_id: string
          source_type: string
          source_url: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          excluded_reason?: string | null
          fetched_at?: string
          field_differences?: Json
          id?: string
          identity_conflicts?: Json
          included_in_score?: boolean
          match_basis?: Json
          match_status?: string
          observed_address?: string | null
          observed_city?: string | null
          observed_domain?: string | null
          observed_name?: string | null
          observed_phone?: string | null
          observed_postal_code?: string | null
          observed_state?: string | null
          screening_run_id?: string
          source_type?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_sources_screening_run_id_fkey"
            columns: ["screening_run_id"]
            isOneToOne: false
            referencedRelation: "screening_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      titan_mail_accounts: {
        Row: {
          created_at: string
          email_address: string
          id: string
          last_synced_at: string | null
          organization_id: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_address: string
          id?: string
          last_synced_at?: string | null
          organization_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_address?: string
          id?: string
          last_synced_at?: string | null
          organization_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "titan_mail_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      titan_mail_messages: {
        Row: {
          account_id: string
          body_text: string
          cc_json: Json
          flags: string[]
          folder: string
          from_json: Json
          has_attachments: boolean
          id: string
          imap_uid: number
          in_reply_to: string | null
          indexed_at: string
          organization_id: string | null
          provider_message_id: string | null
          received_at: string | null
          references_json: Json
          snippet: string
          subject: string
          to_json: Json
          updated_at: string
        }
        Insert: {
          account_id: string
          body_text?: string
          cc_json?: Json
          flags?: string[]
          folder: string
          from_json?: Json
          has_attachments?: boolean
          id?: string
          imap_uid: number
          in_reply_to?: string | null
          indexed_at?: string
          organization_id?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          references_json?: Json
          snippet?: string
          subject?: string
          to_json?: Json
          updated_at?: string
        }
        Update: {
          account_id?: string
          body_text?: string
          cc_json?: Json
          flags?: string[]
          folder?: string
          from_json?: Json
          has_attachments?: boolean
          id?: string
          imap_uid?: number
          in_reply_to?: string | null
          indexed_at?: string
          organization_id?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          references_json?: Json
          snippet?: string
          subject?: string
          to_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "titan_mail_messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "titan_mail_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titan_mail_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finalize_screening_score: {
        Args: {
          p_critical_issues?: Json
          p_planning_target?: number
          p_ratings: Json
          p_screening_run_id: string
        }
        Returns: {
          report_id: string
          total_score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

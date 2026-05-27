/**
 * Supabase Database types for ReadWays.
 *
 * Regenerate after schema changes:
 *   npm run supabase:types
 *
 * This file mirrors the migrations in supabase/migrations/.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "pro_monthly" | "pro_yearly" | "admin";
          subscription_status: "active" | "trialing" | "past_due" | "cancelled";
          current_period_end: string | null;
          trial_ends_at: string | null;
          billing_provider: "iyzico" | "stripe" | null;
          billing_customer_id: string | null;
          onboarding: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro_monthly" | "pro_yearly" | "admin";
          subscription_status?: "active" | "trialing" | "past_due" | "cancelled";
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          billing_provider?: "iyzico" | "stripe" | null;
          billing_customer_id?: string | null;
          onboarding?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro_monthly" | "pro_yearly" | "admin";
          subscription_status?: "active" | "trialing" | "past_due" | "cancelled";
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          billing_provider?: "iyzico" | "stripe" | null;
          billing_customer_id?: string | null;
          onboarding?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          file_name: string;
          file_size: number;
          page_count: number;
          extracted_text: string | null;
          storage_path: string | null;
          original_file_name: string | null;
          language: string;
          status: "processing" | "ready" | "failed" | "needs_ocr";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          file_name: string;
          file_size: number;
          page_count?: number;
          extracted_text?: string | null;
          storage_path?: string | null;
          original_file_name?: string | null;
          language?: string;
          status?: "processing" | "ready" | "failed" | "needs_ocr";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          file_name?: string;
          file_size?: number;
          page_count?: number;
          extracted_text?: string | null;
          storage_path?: string | null;
          original_file_name?: string | null;
          language?: string;
          status?: "processing" | "ready" | "failed" | "needs_ocr";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      document_jobs: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          job_type: "pdf_extraction" | "ocr" | "cleanup";
          status: "pending" | "processing" | "completed" | "failed";
          attempts: number;
          error_message: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          job_type: "pdf_extraction" | "ocr" | "cleanup";
          status?: "pending" | "processing" | "completed" | "failed";
          attempts?: number;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          job_type?: "pdf_extraction" | "ocr" | "cleanup";
          status?: "pending" | "processing" | "completed" | "failed";
          attempts?: number;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_jobs_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
      word_explanations: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          word: string;
          sentence: string;
          sentence_hash: string;
          definition: string | null;
          contextual_meaning: string | null;
          pronunciation: string | null;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          word: string;
          sentence: string;
          sentence_hash: string;
          definition?: string | null;
          contextual_meaning?: string | null;
          pronunciation?: string | null;
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          word?: string;
          sentence?: string;
          sentence_hash?: string;
          definition?: string | null;
          contextual_meaning?: string | null;
          pronunciation?: string | null;
          language?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "word_explanations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "word_explanations_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_words: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          word_explanation_id: string | null;
          word: string;
          status: "learning" | "reviewing" | "mastered";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          word_explanation_id?: string | null;
          word: string;
          status?: "learning" | "reviewing" | "mastered";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          word_explanation_id?: string | null;
          word?: string;
          status?: "learning" | "reviewing" | "mastered";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_words_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_words_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_words_word_explanation_id_fkey";
            columns: ["word_explanation_id"];
            isOneToOne: false;
            referencedRelation: "word_explanations";
            referencedColumns: ["id"];
          }
        ];
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          saved_word_id: string;
          front: string;
          back: string;
          difficulty: number | null;
          next_review_at: string | null;
          review_count: number;
          ease_factor: number;
          last_reviewed_at: string | null;
          interval_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          saved_word_id: string;
          front: string;
          back: string;
          difficulty?: number | null;
          next_review_at?: string | null;
          review_count?: number;
          ease_factor?: number;
          last_reviewed_at?: string | null;
          interval_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          saved_word_id?: string;
          front?: string;
          back?: string;
          difficulty?: number | null;
          next_review_at?: string | null;
          review_count?: number;
          ease_factor?: number;
          last_reviewed_at?: string | null;
          interval_days?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_saved_word_id_fkey";
            columns: ["saved_word_id"];
            isOneToOne: false;
            referencedRelation: "saved_words";
            referencedColumns: ["id"];
          }
        ];
      };
      review_logs: {
        Row: {
          id: string;
          user_id: string;
          flashcard_id: string;
          rating: "hard" | "good" | "easy";
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flashcard_id: string;
          rating: "hard" | "good" | "easy";
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flashcard_id?: string;
          rating?: "hard" | "good" | "easy";
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_logs_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback_submissions: {
        Row: {
          id: string;
          user_id: string;
          type: "bug" | "feature_request" | "general";
          message: string;
          route: string;
          metadata: Json;
          status: "new" | "reviewed" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "bug" | "feature_request" | "general";
          message: string;
          route?: string;
          metadata?: Json;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "bug" | "feature_request" | "general";
          message?: string;
          route?: string;
          metadata?: Json;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_limits: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          ai_explanations_used: number;
          pdf_uploads_used: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          ai_explanations_used?: number;
          pdf_uploads_used?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          ai_explanations_used?: number;
          pdf_uploads_used?: number;
        };
        Relationships: [
          {
            foreignKeyName: "usage_limits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

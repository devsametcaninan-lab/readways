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
          plan: "free" | "pro";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro";
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
          status: "processing" | "ready" | "failed";
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
          status?: "processing" | "ready" | "failed";
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
          status?: "processing" | "ready" | "failed";
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

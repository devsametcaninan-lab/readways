import type { Database } from "./database.types";
import type {
  BillingProvider,
  DocumentJobStatus,
  DocumentJobType,
  DocumentStatus,
  Plan,
  ReviewRating,
  SavedWordStatus,
  SubscriptionStatus
} from "./schema";

export type { Database };
export type {
  BillingProvider,
  DocumentJobStatus,
  DocumentJobType,
  DocumentStatus,
  Plan,
  ReviewRating,
  SavedWordStatus,
  SubscriptionStatus
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export type DocumentJob = Database["public"]["Tables"]["document_jobs"]["Row"];
export type DocumentJobInsert = Database["public"]["Tables"]["document_jobs"]["Insert"];
export type DocumentJobUpdate = Database["public"]["Tables"]["document_jobs"]["Update"];

export type WordExplanation = Database["public"]["Tables"]["word_explanations"]["Row"];
export type WordExplanationInsert = Database["public"]["Tables"]["word_explanations"]["Insert"];
export type WordExplanationUpdate = Database["public"]["Tables"]["word_explanations"]["Update"];

export type SavedWord = Database["public"]["Tables"]["saved_words"]["Row"];
export type SavedWordInsert = Database["public"]["Tables"]["saved_words"]["Insert"];
export type SavedWordUpdate = Database["public"]["Tables"]["saved_words"]["Update"];

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export type ReviewLog = Database["public"]["Tables"]["review_logs"]["Row"];
export type ReviewLogInsert = Database["public"]["Tables"]["review_logs"]["Insert"];

export type UsageLimit = Database["public"]["Tables"]["usage_limits"]["Row"];
export type UsageLimitInsert = Database["public"]["Tables"]["usage_limits"]["Insert"];
export type UsageLimitUpdate = Database["public"]["Tables"]["usage_limits"]["Update"];

export type SupabaseClient = import("@supabase/supabase-js").SupabaseClient<Database>;

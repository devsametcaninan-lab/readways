-- ReadWays: core schema (tables, constraints, indexes, triggers)

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default timezone('utc', now())
);

create index profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  file_name text not null,
  file_size bigint not null check (file_size >= 0),
  page_count integer not null default 0 check (page_count >= 0),
  extracted_text text,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index documents_user_id_idx on public.documents (user_id);
create index documents_user_id_created_at_idx on public.documents (user_id, created_at desc);
create index documents_status_idx on public.documents (status);

create trigger documents_set_updated_at
  before update on public.documents
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- word_explanations
-- ---------------------------------------------------------------------------
create table public.word_explanations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  word text not null,
  sentence text not null,
  sentence_hash text not null,
  definition text,
  contextual_meaning text,
  pronunciation text,
  language text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  constraint word_explanations_word_not_empty check (char_length(trim(word)) > 0),
  constraint word_explanations_sentence_not_empty check (char_length(trim(sentence)) > 0),
  constraint word_explanations_sentence_hash_not_empty check (char_length(trim(sentence_hash)) > 0)
);

create unique index word_explanations_user_document_word_sentence_uidx
  on public.word_explanations (user_id, document_id, word, sentence_hash);

create index word_explanations_user_id_idx on public.word_explanations (user_id);
create index word_explanations_document_id_idx on public.word_explanations (document_id);
create index word_explanations_word_idx on public.word_explanations (word);

-- ---------------------------------------------------------------------------
-- saved_words
-- ---------------------------------------------------------------------------
create table public.saved_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  word_explanation_id uuid references public.word_explanations (id) on delete set null,
  word text not null,
  status text not null default 'learning' check (status in ('learning', 'reviewing', 'mastered')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint saved_words_word_not_empty check (char_length(trim(word)) > 0)
);

create index saved_words_user_id_idx on public.saved_words (user_id);
create index saved_words_document_id_idx on public.saved_words (document_id);
create index saved_words_user_id_status_idx on public.saved_words (user_id, status);
create index saved_words_word_explanation_id_idx on public.saved_words (word_explanation_id);

-- ---------------------------------------------------------------------------
-- flashcards
-- ---------------------------------------------------------------------------
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  saved_word_id uuid not null references public.saved_words (id) on delete cascade,
  front text not null,
  back text not null,
  difficulty smallint check (difficulty is null or (difficulty >= 1 and difficulty <= 5)),
  next_review_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint flashcards_front_not_empty check (char_length(trim(front)) > 0),
  constraint flashcards_back_not_empty check (char_length(trim(back)) > 0)
);

create index flashcards_user_id_idx on public.flashcards (user_id);
create index flashcards_saved_word_id_idx on public.flashcards (saved_word_id);
create index flashcards_user_id_next_review_at_idx on public.flashcards (user_id, next_review_at);

-- ---------------------------------------------------------------------------
-- review_logs
-- ---------------------------------------------------------------------------
create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  rating text not null check (rating in ('hard', 'good', 'easy')),
  reviewed_at timestamptz not null default timezone('utc', now())
);

create index review_logs_user_id_idx on public.review_logs (user_id);
create index review_logs_flashcard_id_idx on public.review_logs (flashcard_id);
create index review_logs_user_id_reviewed_at_idx on public.review_logs (user_id, reviewed_at desc);

-- ---------------------------------------------------------------------------
-- usage_limits
-- ---------------------------------------------------------------------------
create table public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default (timezone('utc', now()))::date,
  ai_explanations_used integer not null default 0 check (ai_explanations_used >= 0),
  pdf_uploads_used integer not null default 0 check (pdf_uploads_used >= 0),
  constraint usage_limits_user_date_unique unique (user_id, date)
);

create index usage_limits_user_id_date_idx on public.usage_limits (user_id, date desc);

-- ---------------------------------------------------------------------------
-- auth hook: profile on signup
-- ---------------------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

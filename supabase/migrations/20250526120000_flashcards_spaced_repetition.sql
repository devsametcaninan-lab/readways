-- Spaced repetition fields for flashcards
alter table public.flashcards
  add column if not exists review_count integer not null default 0,
  add column if not exists ease_factor numeric(4, 2) not null default 2.5,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists interval_days integer not null default 0;

alter table public.flashcards
  drop constraint if exists flashcards_review_count_non_negative;

alter table public.flashcards
  add constraint flashcards_review_count_non_negative check (review_count >= 0);

alter table public.flashcards
  drop constraint if exists flashcards_interval_days_non_negative;

alter table public.flashcards
  add constraint flashcards_interval_days_non_negative check (interval_days >= 0);

alter table public.flashcards
  drop constraint if exists flashcards_ease_factor_range;

alter table public.flashcards
  add constraint flashcards_ease_factor_range check (ease_factor >= 1.3 and ease_factor <= 3.0);

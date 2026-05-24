-- ReadWays: Row Level Security policies (users access only their own rows)

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy: profiles are removed via auth.users cascade

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents_update_own"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "documents_delete_own"
  on public.documents for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- word_explanations
-- ---------------------------------------------------------------------------
alter table public.word_explanations enable row level security;

create policy "word_explanations_select_own"
  on public.word_explanations for select
  using (auth.uid() = user_id);

create policy "word_explanations_insert_own"
  on public.word_explanations for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "word_explanations_update_own"
  on public.word_explanations for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "word_explanations_delete_own"
  on public.word_explanations for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_words
-- ---------------------------------------------------------------------------
alter table public.saved_words enable row level security;

create policy "saved_words_select_own"
  on public.saved_words for select
  using (auth.uid() = user_id);

create policy "saved_words_insert_own"
  on public.saved_words for insert
  with check (
    auth.uid() = user_id
    and (
      document_id is null
      or exists (
        select 1 from public.documents d
        where d.id = document_id and d.user_id = auth.uid()
      )
    )
    and (
      word_explanation_id is null
      or exists (
        select 1 from public.word_explanations we
        where we.id = word_explanation_id and we.user_id = auth.uid()
      )
    )
  );

create policy "saved_words_update_own"
  on public.saved_words for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved_words_delete_own"
  on public.saved_words for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- flashcards
-- ---------------------------------------------------------------------------
alter table public.flashcards enable row level security;

create policy "flashcards_select_own"
  on public.flashcards for select
  using (auth.uid() = user_id);

create policy "flashcards_insert_own"
  on public.flashcards for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.saved_words sw
      where sw.id = saved_word_id and sw.user_id = auth.uid()
    )
  );

create policy "flashcards_update_own"
  on public.flashcards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "flashcards_delete_own"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- review_logs
-- ---------------------------------------------------------------------------
alter table public.review_logs enable row level security;

create policy "review_logs_select_own"
  on public.review_logs for select
  using (auth.uid() = user_id);

create policy "review_logs_insert_own"
  on public.review_logs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.flashcards f
      where f.id = flashcard_id and f.user_id = auth.uid()
    )
  );

-- Review history is append-only for MVP
-- No update/delete policies

-- ---------------------------------------------------------------------------
-- usage_limits
-- ---------------------------------------------------------------------------
alter table public.usage_limits enable row level security;

create policy "usage_limits_select_own"
  on public.usage_limits for select
  using (auth.uid() = user_id);

create policy "usage_limits_insert_own"
  on public.usage_limits for insert
  with check (auth.uid() = user_id);

create policy "usage_limits_update_own"
  on public.usage_limits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "usage_limits_delete_own"
  on public.usage_limits for delete
  using (auth.uid() = user_id);

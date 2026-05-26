-- Allow users to delete their own review history when removing flashcards/documents.
create policy "review_logs_delete_own"
  on public.review_logs for delete
  using (auth.uid() = user_id);

-- In-app beta feedback (no email delivery)

create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  message text not null,
  route text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  constraint feedback_submissions_type_allowed check (
    type in ('bug', 'feature_request', 'general')
  ),
  constraint feedback_submissions_status_allowed check (
    status in ('new', 'reviewed', 'resolved')
  ),
  constraint feedback_submissions_message_not_empty check (char_length(trim(message)) >= 10),
  constraint feedback_submissions_message_max_length check (char_length(message) <= 5000),
  constraint feedback_submissions_route_max_length check (char_length(route) <= 500)
);

create index feedback_submissions_user_id_created_at_idx
  on public.feedback_submissions (user_id, created_at desc);

create index feedback_submissions_status_created_at_idx
  on public.feedback_submissions (status, created_at desc);

alter table public.feedback_submissions enable row level security;

create policy "feedback_submissions_insert_own"
  on public.feedback_submissions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "feedback_submissions_select_own"
  on public.feedback_submissions for select
  to authenticated
  using (auth.uid() = user_id);

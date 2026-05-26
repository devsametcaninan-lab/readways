-- Internal product analytics (no third-party SDK)

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_name text not null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint analytics_events_event_name_not_empty check (char_length(trim(event_name)) > 0),
  constraint analytics_events_event_type_not_empty check (char_length(trim(event_type)) > 0),
  constraint analytics_events_event_type_allowed check (
    event_type in ('product', 'ai', 'error')
  )
);

create index analytics_events_user_id_created_at_idx
  on public.analytics_events (user_id, created_at desc);

create index analytics_events_event_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);

create index analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

create policy "analytics_events_select_own"
  on public.analytics_events for select
  using (auth.uid() = user_id);

create policy "analytics_events_insert_own"
  on public.analytics_events for insert
  with check (user_id is null or auth.uid() = user_id);

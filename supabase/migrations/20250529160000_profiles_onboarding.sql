-- Lightweight first-session onboarding flags (JSON, per-step timestamps)

alter table public.profiles
  add column if not exists onboarding jsonb not null default '{}'::jsonb;

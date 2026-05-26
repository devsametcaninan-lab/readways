-- Subscription and billing fields on profiles (no payment provider yet)

update public.profiles
set plan = 'pro_monthly'
where plan = 'pro';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'pro_monthly', 'pro_yearly', 'admin'));

alter table public.profiles
  add column if not exists subscription_status text not null default 'active';

alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('active', 'trialing', 'past_due', 'cancelled'));

alter table public.profiles
  add column if not exists current_period_end timestamptz;

alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

alter table public.profiles
  add column if not exists billing_provider text;

alter table public.profiles
  drop constraint if exists profiles_billing_provider_check;

alter table public.profiles
  add constraint profiles_billing_provider_check
  check (billing_provider is null or billing_provider in ('iyzico', 'stripe'));

alter table public.profiles
  add column if not exists billing_customer_id text;

create index if not exists profiles_plan_idx on public.profiles (plan);

create index if not exists profiles_subscription_status_idx
  on public.profiles (subscription_status);

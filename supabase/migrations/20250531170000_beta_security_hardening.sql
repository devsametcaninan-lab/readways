-- Closed-beta security: prevent self-escalation of plan/billing and AI usage limit bypass.

-- ---------------------------------------------------------------------------
-- profiles: authenticated users cannot set billing/plan fields
-- ---------------------------------------------------------------------------
create or replace function public.profiles_guard_sensitive_columns()
returns trigger
language plpgsql
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.jwt() ->> 'role', '');

  if jwt_role = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan := 'free';
    new.subscription_status := 'active';
    new.current_period_end := null;
    new.trial_ends_at := null;
    new.billing_provider := null;
    new.billing_customer_id := null;
    return new;
  end if;

  new.plan := old.plan;
  new.subscription_status := old.subscription_status;
  new.current_period_end := old.current_period_end;
  new.trial_ends_at := old.trial_ends_at;
  new.billing_provider := old.billing_provider;
  new.billing_customer_id := old.billing_customer_id;
  return new;
end;
$$;

drop trigger if exists profiles_guard_sensitive_columns on public.profiles;

create trigger profiles_guard_sensitive_columns
  before insert or update on public.profiles
  for each row
  execute function public.profiles_guard_sensitive_columns();

-- ---------------------------------------------------------------------------
-- usage_limits: remove client-side counter tampering
-- ---------------------------------------------------------------------------
drop policy if exists "usage_limits_update_own" on public.usage_limits;
drop policy if exists "usage_limits_delete_own" on public.usage_limits;

create or replace function public.ensure_today_usage_row()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.usage_limits (user_id, date, ai_explanations_used, pdf_uploads_used)
  values (v_uid, v_today, 0, 0)
  on conflict (user_id, date) do nothing;
end;
$$;

create or replace function public.increment_ai_explanations_used()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_next integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.usage_limits (user_id, date, ai_explanations_used, pdf_uploads_used)
  values (v_uid, v_today, 1, 0)
  on conflict (user_id, date)
  do update
    set ai_explanations_used = public.usage_limits.ai_explanations_used + 1
  returning ai_explanations_used into v_next;

  return v_next;
end;
$$;

revoke all on function public.ensure_today_usage_row() from public;
revoke all on function public.increment_ai_explanations_used() from public;
grant execute on function public.ensure_today_usage_row() to authenticated;
grant execute on function public.increment_ai_explanations_used() to authenticated;

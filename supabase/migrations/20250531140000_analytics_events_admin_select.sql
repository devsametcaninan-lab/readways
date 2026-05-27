-- Allow admin plan users to read platform-wide analytics for internal monitoring.

create policy "analytics_events_select_admin"
  on public.analytics_events for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.plan = 'admin'
    )
  );

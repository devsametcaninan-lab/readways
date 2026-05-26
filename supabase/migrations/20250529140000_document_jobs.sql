-- Background document processing jobs (foundation for async workers)

create table public.document_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  job_type text not null check (job_type in ('pdf_extraction', 'ocr', 'cleanup')),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed')
  ),
  attempts integer not null default 0 check (attempts >= 0),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index document_jobs_document_id_idx on public.document_jobs (document_id);
create index document_jobs_user_id_idx on public.document_jobs (user_id);
create index document_jobs_status_idx on public.document_jobs (status);

create index document_jobs_document_id_job_type_created_at_idx
  on public.document_jobs (document_id, job_type, created_at desc);

create trigger document_jobs_set_updated_at
  before update on public.document_jobs
  for each row
  execute function public.set_updated_at();

alter table public.document_jobs enable row level security;

create policy "document_jobs_select_own"
  on public.document_jobs for select
  using (auth.uid() = user_id);

create policy "document_jobs_insert_own"
  on public.document_jobs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "document_jobs_update_own"
  on public.document_jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "document_jobs_delete_own"
  on public.document_jobs for delete
  using (auth.uid() = user_id);

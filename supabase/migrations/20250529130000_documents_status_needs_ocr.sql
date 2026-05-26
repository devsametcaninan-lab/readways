-- Extend documents.status to support OCR-required scanned PDFs

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'documents'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format(
      'alter table public.documents drop constraint if exists %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.documents
  add constraint documents_status_check
  check (status in ('processing', 'ready', 'failed', 'needs_ocr'));

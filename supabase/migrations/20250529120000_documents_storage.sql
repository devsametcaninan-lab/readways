-- PDF file location in Supabase Storage (extracted text remains on documents)

alter table public.documents
  add column if not exists storage_path text,
  add column if not exists original_file_name text;

create index if not exists documents_storage_path_idx
  on public.documents (storage_path)
  where storage_path is not null;

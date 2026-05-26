alter table public.documents
  add column if not exists language text not null default 'en';

alter table public.documents
  drop constraint if exists documents_language_supported;

alter table public.documents
  add constraint documents_language_supported
  check (language in ('en', 'tr', 'de', 'fr', 'es'));

-- Deduplicate before adding uniqueness (keep earliest row per key).
delete from public.flashcards f
using public.flashcards f2
where f.saved_word_id = f2.saved_word_id
  and f.created_at > f2.created_at;

delete from public.saved_words sw
using public.saved_words sw2
where sw.user_id = sw2.user_id
  and sw.document_id = sw2.document_id
  and sw.document_id is not null
  and sw.word = sw2.word
  and sw.created_at > sw2.created_at;

create unique index if not exists saved_words_user_document_word_uidx
  on public.saved_words (user_id, document_id, word)
  where document_id is not null;

create unique index if not exists flashcards_saved_word_id_uidx
  on public.flashcards (saved_word_id);

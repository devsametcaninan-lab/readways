-- Cache distinct explanations per resolved explanation language (word_explanations.language).

drop index if exists public.word_explanations_user_document_word_sentence_uidx;

create unique index word_explanations_user_document_word_sentence_language_uidx
  on public.word_explanations (user_id, document_id, word, sentence_hash, language);

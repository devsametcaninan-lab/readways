# ReadWays AI Handoff

## Product

ReadWays is a PDF-based language learning SaaS.

Users upload PDFs, read real content, click unknown words, get contextual meanings, save words as flashcards, and review them later.

## Current Stack

- Next.js App Router

- TypeScript

- Tailwind CSS

- Supabase Auth

- Supabase Postgres

- Google Auth

## Current Status

Completed:

- Landing page

- Dashboard/app shell

- Google authentication

- Protected app routes

- Supabase database foundation

- Real PDF upload UI

- Real PDF text extraction

- Documents saved to Supabase

- Real reader route using uploaded documents

- Real text selection system

- Saved Words UI

- Flashcards Review UI

## Important Rules

- Do not modify the landing page unless explicitly asked.

- Work in small steps.

- Never implement multiple major systems in one prompt.

- After every stable feature, commit changes.

- Keep ReadWays dark premium Linear-inspired UI.

- Do not break existing routes.

## Backend Tables

- profiles

- documents

- word_explanations

- saved_words

- flashcards

- review_logs

- usage_limits

## Next Major Step

Implement AI Dictionary Layer safely:

1. API skeleton

2. cache check

3. rate limit

4. request dedupe

5. OpenAI call

6. save explanation

7. frontend integration

## AI Endpoint Principle

Clicking a word only explains it.

Saving a word creates saved_words + flashcards.

## Cost Protection

- Cache repeated word + sentenceHash

- Do not charge usage for cache hits

- Rate limit Free/Pro users

- Never expose OpenAI key on frontend
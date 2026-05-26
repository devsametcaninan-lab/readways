# Billing webhooks (future)

Provider-specific routes will live here, for example:

- `POST /api/billing/webhooks/stripe`
- `POST /api/billing/webhooks/iyzico`

Each handler should verify signatures, parse the provider payload, then call
`syncSubscriptionFromProvider` from `@/lib/billing/webhooks/sync-subscription`.

No checkout or webhook routes are implemented yet.

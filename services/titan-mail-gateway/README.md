# Titan Mail Gateway service

A small PDM-owned Node service for direct Titan IMAP/SMTP access.

## Local/container start

1. Copy `.env.example` into your host's secret environment (do not commit a populated `.env`).
2. Apply the PDM Supabase migration `0012_add_titan_mail_gateway.sql`.
3. Install dependencies with `npm install`.
4. Run `npm start`.
5. Verify with `GET /v1/verify` using the gateway bearer token.

See `../../docs/TITAN_MAIL_GATEWAY.md` for the architecture and production checklist.

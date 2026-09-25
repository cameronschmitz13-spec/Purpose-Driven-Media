# PDM Titan Mail Gateway

## Decision

PDM uses a self-hosted mail gateway that talks directly to Titan over IMAP/SMTP instead of depending on Titan MCP registration or a metered third-party inbox connector.

This is the preferred path for PDM's operational mailbox because it gives PDM control of the integration surface and does not introduce a PDM-side per-message or per-tool quota. Titan's own mailbox, anti-abuse, and sending limits still apply.

## Architecture

```text
Titan Mail
  ├─ IMAP/TLS 993  -> read/search/sync
  └─ SMTP/TLS 465  -> send/reply
          |
          v
services/titan-mail-gateway
          |
          +-> Supabase service-only mail index
          +-> PDM CRM / Shepherd's List
          +-> PDM 360 Advisor tools
```

The gateway exposes:

- `GET /health` — non-secret liveness check
- `GET /v1/verify` — verify both IMAP and SMTP credentials
- `POST /v1/sync` — sync recent Titan mail into the service-only Supabase index
- `POST /v1/search` — live IMAP search and index matching messages
- `GET /v1/messages/:id` — fetch the current live message body by indexed message id
- `POST /v1/send` — send from the configured Titan mailbox
- `POST /v1/reply` — threaded reply to a previously indexed Titan message

All `/v1/*` routes require `Authorization: Bearer <PDM_MAIL_GATEWAY_TOKEN>`.

## Titan settings

Default Titan US/global endpoints:

- IMAP: `imap.titan.email`, port `993`, SSL/TLS
- SMTP: `smtp.titan.email`, port `465`, SSL/TLS
- SMTP fallback if required by the environment: port `587`, STARTTLS

If Titan 2FA is enabled, use a Titan application password rather than the normal mailbox password.

Some Titan reseller regions use different endpoints. Confirm the mailbox region before production deployment and override the `TITAN_*_HOST` values if required.

## Secrets

Never commit mailbox credentials.

Configure these only in the deployment platform's encrypted secret store:

- `TITAN_EMAIL`
- `TITAN_APP_PASSWORD`
- `PDM_MAIL_GATEWAY_TOKEN` (minimum 32 random characters; 64 recommended)
- `SUPABASE_SECRET_KEY`
- `SUPABASE_URL`

The database stores mailbox metadata and indexed mail, never the Titan password.

## Deployment

Run the gateway on a persistent Node 20+ host/container. Do not rely on a short-lived serverless function for the background sync loop.

The included Dockerfile can run on a persistent container service. Health check path: `/health`.

Recommended production sequence:

1. Apply `supabase/migrations/0012_add_titan_mail_gateway.sql`.
2. Deploy `services/titan-mail-gateway` on a persistent container host.
3. Add the secret environment values above.
4. Call authenticated `GET /v1/verify`.
5. Call `POST /v1/sync` with a small limit and confirm the index rows.
6. Wire read/search tools into Shepherd's List and PDM 360 Advisor.
7. Wire send/reply only behind explicit user actions; do not auto-send outreach.
8. Add monitoring for repeated auth failures and sync errors.

## Security boundaries

- Titan credentials exist only in the gateway environment.
- `titan_mail_accounts` and `titan_mail_messages` have RLS enabled and no browser policies.
- `anon` and `authenticated` database roles have table privileges revoked.
- The gateway uses the Supabase service role server-side only.
- Outbound mail always uses the configured Titan mailbox as `From`; callers cannot spoof another sender.
- Request bodies are size-limited and validated.
- Send/reply actions create `audit_events`; message bodies and credentials are not copied into audit payloads.
- The gateway token is compared using a timing-safe hash comparison.

## PDM integration contract

The PDM application should call the gateway server-to-server. Never expose `PDM_MAIL_GATEWAY_TOKEN` to browser code.

Advisor/CRM tools should initially be read-first:

- search correspondence for an organization/domain
- fetch a thread/message
- summarize correspondence
- associate a message with a CRM record
- draft a reply

Actual `send` or `reply` calls should require an explicit operator action until PDM has a separate, reviewed automation policy.

## What “unlimited” means

PDM does not impose a usage quota in this gateway. Reads/searches are direct IMAP operations and sends are direct SMTP operations. The practical constraints are hosting capacity, mailbox size, connection concurrency, and Titan's own service/sending limits. The gateway must not be used to evade provider anti-abuse controls.

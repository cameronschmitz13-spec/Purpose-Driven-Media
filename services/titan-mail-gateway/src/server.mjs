import crypto from "node:crypto";
import Fastify from "fastify";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const required = ["PDM_MAIL_GATEWAY_TOKEN", "TITAN_EMAIL", "TITAN_APP_PASSWORD", "SUPABASE_URL", "SUPABASE_SECRET_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const config = {
  port: Number(process.env.PORT || 8787),
  token: process.env.PDM_MAIL_GATEWAY_TOKEN,
  email: process.env.TITAN_EMAIL.trim().toLowerCase(),
  password: process.env.TITAN_APP_PASSWORD,
  imapHost: process.env.TITAN_IMAP_HOST || "imap.titan.email",
  imapPort: Number(process.env.TITAN_IMAP_PORT || 993),
  smtpHost: process.env.TITAN_SMTP_HOST || "smtp.titan.email",
  smtpPort: Number(process.env.TITAN_SMTP_PORT || 465),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  organizationId: process.env.PDM_DEFAULT_ORGANIZATION_ID || null,
  syncFolder: process.env.SYNC_FOLDER || "INBOX",
  syncRecentMessages: Math.min(Math.max(Number(process.env.SYNC_RECENT_MESSAGES || 150), 1), 1000),
  syncIntervalSeconds: Math.max(Number(process.env.SYNC_INTERVAL_SECONDS || 300), 0),
  logLevel: process.env.LOG_LEVEL || "info",
};

const app = Fastify({ logger: { level: config.logLevel }, bodyLimit: 2 * 1024 * 1024 });
const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const smtp = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: { user: config.email, pass: config.password },
  requireTLS: config.smtpPort !== 465,
});

let accountId = null;
let syncRunning = false;

function tokenMatches(candidate) {
  if (!candidate) return false;
  const expected = crypto.createHash("sha256").update(config.token).digest();
  const received = crypto.createHash("sha256").update(candidate).digest();
  return crypto.timingSafeEqual(expected, received);
}

app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/health") return;
  const header = request.headers.authorization || "";
  const candidate = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!tokenMatches(candidate)) return reply.code(401).send({ error: "Unauthorized" });
});

function makeImapClient() {
  return new ImapFlow({
    host: config.imapHost,
    port: config.imapPort,
    secure: true,
    auth: { user: config.email, pass: config.password },
    logger: false,
  });
}

function addressList(value) {
  return (value?.value || []).map((item) => ({
    name: item.name || null,
    address: item.address ? String(item.address).toLowerCase() : null,
  })).filter((item) => item.address);
}

function snippet(text, max = 500) {
  return String(text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function ensureAccount() {
  if (accountId) return accountId;
  const payload = {
    email_address: config.email,
    provider: "titan",
    status: "active",
    organization_id: config.organizationId,
  };
  const { data, error } = await supabase
    .from("titan_mail_accounts")
    .upsert(payload, { onConflict: "email_address" })
    .select("id")
    .single();
  if (error) throw error;
  accountId = data.id;
  return accountId;
}

async function parseFetchedMessage(folder, message) {
  const parsed = await simpleParser(message.source);
  return {
    account_id: await ensureAccount(),
    organization_id: config.organizationId,
    folder,
    imap_uid: Number(message.uid),
    provider_message_id: parsed.messageId || message.envelope?.messageId || null,
    in_reply_to: parsed.inReplyTo || null,
    references_json: Array.isArray(parsed.references) ? parsed.references : parsed.references ? [parsed.references] : [],
    subject: parsed.subject || message.envelope?.subject || "(no subject)",
    from_json: addressList(parsed.from),
    to_json: addressList(parsed.to),
    cc_json: addressList(parsed.cc),
    received_at: (parsed.date || message.internalDate || new Date()).toISOString(),
    flags: [...(message.flags || [])].map(String),
    has_attachments: (parsed.attachments?.length || 0) > 0,
    body_text: String(parsed.text || "").slice(0, 250000),
    snippet: snippet(parsed.text || parsed.html || ""),
    updated_at: new Date().toISOString(),
  };
}

async function upsertMessage(row) {
  const { data, error } = await supabase
    .from("titan_mail_messages")
    .upsert(row, { onConflict: "account_id,folder,imap_uid" })
    .select("id,folder,imap_uid,subject,from_json,to_json,received_at,snippet,flags,has_attachments")
    .single();
  if (error) throw error;
  return data;
}

async function fetchUids(folder, uids) {
  if (!uids.length) return [];
  const client = makeImapClient();
  await client.connect();
  const lock = await client.getMailboxLock(folder);
  const output = [];
  try {
    for await (const message of client.fetch(uids.join(","), {
      uid: true,
      envelope: true,
      flags: true,
      internalDate: true,
      source: true,
    }, { uid: true })) {
      const row = await parseFetchedMessage(folder, message);
      output.push(await upsertMessage(row));
    }
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
  return output.sort((a, b) => new Date(b.received_at) - new Date(a.received_at));
}

async function syncRecent(folder = config.syncFolder, limit = config.syncRecentMessages) {
  if (syncRunning) return { skipped: true, reason: "sync_already_running" };
  syncRunning = true;
  const startedAt = Date.now();
  const client = makeImapClient();
  try {
    await client.connect();
    const lock = await client.getMailboxLock(folder);
    const uids = [];
    try {
      const total = Number(client.mailbox?.exists || 0);
      if (total > 0) {
        const start = Math.max(1, total - limit + 1);
        for await (const message of client.fetch(`${start}:*`, { uid: true })) uids.push(Number(message.uid));
      }
    } finally {
      lock.release();
      await client.logout().catch(() => {});
    }
    const messages = await fetchUids(folder, uids);
    const id = await ensureAccount();
    await supabase.from("titan_mail_accounts").update({ last_synced_at: new Date().toISOString(), status: "active" }).eq("id", id);
    return { synced: messages.length, folder, elapsed_ms: Date.now() - startedAt };
  } catch (error) {
    const id = await ensureAccount().catch(() => null);
    if (id) await supabase.from("titan_mail_accounts").update({ status: "error" }).eq("id", id);
    throw error;
  } finally {
    syncRunning = false;
  }
}

async function searchLive(query, folder, limit) {
  const client = makeImapClient();
  await client.connect();
  const lock = await client.getMailboxLock(folder);
  let selected = [];
  try {
    const uids = await client.search({ text: query }, { uid: true });
    selected = uids.slice(-limit).reverse();
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
  return fetchUids(folder, selected);
}

async function getStoredMessage(id) {
  const { data, error } = await supabase
    .from("titan_mail_messages")
    .select("*")
    .eq("id", id)
    .eq("account_id", await ensureAccount())
    .single();
  if (error || !data) return null;
  return data;
}

async function fetchOneLive(record) {
  const client = makeImapClient();
  await client.connect();
  const lock = await client.getMailboxLock(record.folder);
  try {
    for await (const message of client.fetch(String(record.imap_uid), {
      uid: true,
      envelope: true,
      flags: true,
      internalDate: true,
      source: true,
    }, { uid: true })) {
      const row = await parseFetchedMessage(record.folder, message);
      await upsertMessage(row);
      return { ...record, ...row, id: record.id };
    }
    return null;
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
}

async function audit(eventType, payload = {}) {
  await supabase.from("audit_events").insert({
    organization_id: config.organizationId,
    event_type: eventType,
    payload: { mailbox: config.email, ...payload },
  });
}

const recipients = z.union([z.email(), z.array(z.email()).min(1).max(50)]);
const sendSchema = z.object({
  to: recipients,
  cc: recipients.optional(),
  bcc: recipients.optional(),
  subject: z.string().trim().min(1).max(998),
  text: z.string().max(500000).optional(),
  html: z.string().max(1000000).optional(),
}).refine((v) => v.text || v.html, { message: "text or html is required" });
const replySchema = z.object({
  message_id: z.uuid(),
  text: z.string().max(500000).optional(),
  html: z.string().max(1000000).optional(),
}).refine((v) => v.text || v.html, { message: "text or html is required" });

app.get("/health", async () => ({ service: "pdm-titan-mail-gateway", status: "ok" }));

app.get("/v1/verify", async () => {
  const imap = makeImapClient();
  await imap.connect();
  const mailbox = { host: config.imapHost, port: config.imapPort, secure: true };
  await imap.logout();
  await smtp.verify();
  await ensureAccount();
  return { ok: true, mailbox, smtp: { host: config.smtpHost, port: config.smtpPort, secure: config.smtpPort === 465 } };
});

app.post("/v1/sync", async (request) => {
  const body = z.object({ folder: z.string().min(1).max(200).optional(), limit: z.number().int().min(1).max(1000).optional() }).parse(request.body || {});
  return syncRecent(body.folder || config.syncFolder, body.limit || config.syncRecentMessages);
});

app.post("/v1/search", async (request) => {
  const body = z.object({ query: z.string().trim().min(1).max(200), folder: z.string().min(1).max(200).default(config.syncFolder), limit: z.number().int().min(1).max(50).default(20) }).parse(request.body);
  return { query: body.query, results: await searchLive(body.query, body.folder, body.limit) };
});

app.get("/v1/messages/:id", async (request, reply) => {
  const id = z.uuid().parse(request.params.id);
  const record = await getStoredMessage(id);
  if (!record) return reply.code(404).send({ error: "Message not found" });
  const live = await fetchOneLive(record);
  if (!live) return reply.code(410).send({ error: "Message no longer exists in Titan" });
  return {
    id: live.id,
    folder: live.folder,
    imap_uid: live.imap_uid,
    provider_message_id: live.provider_message_id,
    subject: live.subject,
    from: live.from_json,
    to: live.to_json,
    cc: live.cc_json,
    received_at: live.received_at,
    flags: live.flags,
    has_attachments: live.has_attachments,
    body_text: live.body_text,
  };
});

app.post("/v1/send", async (request, reply) => {
  const body = sendSchema.parse(request.body);
  const info = await smtp.sendMail({ from: config.email, ...body });
  await audit("titan_mail_sent", { message_id: info.messageId, to: body.to, cc: body.cc || null, subject: body.subject });
  return reply.code(201).send({ sent: true, message_id: info.messageId });
});

app.post("/v1/reply", async (request, reply) => {
  const body = replySchema.parse(request.body);
  const stored = await getStoredMessage(body.message_id);
  if (!stored) return reply.code(404).send({ error: "Message not found" });
  const original = await fetchOneLive(stored);
  if (!original) return reply.code(410).send({ error: "Message no longer exists in Titan" });
  const to = original.from_json?.[0]?.address;
  if (!to) return reply.code(422).send({ error: "Original sender address is unavailable" });
  const references = [...(original.references_json || []), original.provider_message_id].filter(Boolean).join(" ");
  const subject = /^re:/i.test(original.subject || "") ? original.subject : `Re: ${original.subject || ""}`.trim();
  const info = await smtp.sendMail({
    from: config.email,
    to,
    subject,
    text: body.text,
    html: body.html,
    inReplyTo: original.provider_message_id || undefined,
    references: references || undefined,
  });
  await audit("titan_mail_replied", { original_message_id: body.message_id, message_id: info.messageId, to, subject });
  return reply.code(201).send({ sent: true, message_id: info.messageId, reply_to: body.message_id });
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof z.ZodError) return reply.code(400).send({ error: "Invalid request", details: error.issues });
  request.log.error({ err: error }, "request failed");
  return reply.code(500).send({ error: "Mail gateway request failed" });
});

await ensureAccount();
await app.listen({ port: config.port, host: "0.0.0.0" });

if (config.syncIntervalSeconds > 0) {
  setInterval(() => {
    syncRecent().catch((error) => app.log.error({ err: error }, "background Titan sync failed"));
  }, config.syncIntervalSeconds * 1000).unref();
}

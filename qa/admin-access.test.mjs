// Run: node --test qa/admin-access.test.mjs
// Uses the adjacent canonical Sites checkout (override PDM_SITE_DIR if needed).
// No live credentials, requests, or report mutations are performed.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const site = process.env.PDM_SITE_DIR || resolve(dirname(fileURLToPath(import.meta.url)), '../../pdm-site');
const siteRequire = createRequire(resolve(site, 'package.json'));
const ts = siteRequire('typescript');
const OWNER = 'cameronschmitz13@gmail.com';
function load(path, imports, globals = {}) {
  const source = readFileSync(resolve(site, path), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, Request, Response, Headers, AbortSignal,
    require(id) { if (Object.hasOwn(imports, id)) return imports[id]; throw new Error(`Unexpected dependency: ${id}`); },
    ...globals,
  }, { filename: path });
  return module.exports;
}
function browser(getSession) {
  const calls = [];
  const window = { location: { origin: 'https://purposedrivenmedia.group' }, fetch: async (input, init) => {
    calls.push({ input, init, headers: new Headers(init?.headers || (input instanceof Request ? input.headers : undefined)) });
    return Response.json({ ok: true });
  } };
  return { calls, ...load('lib/pdm-fetch.ts', { './supabase-browser': { getSupabaseBrowserClient: () => ({ auth: { getSession } }) } }, { window }) };
}

test('protected request waits for restored session and preserves deletion method/body', async () => {
  let restore;
  const pending = new Promise(resolve => { restore = resolve; });
  const app = browser(() => pending);
  const operation = app.pdmFetch('/api/organization/screenings', { method: 'DELETE', body: '{"ids":["fixture"]}', headers: { 'content-type': 'application/json' } });
  await Promise.resolve();
  assert.equal(app.calls.length, 0);
  restore({ data: { session: { access_token: 'restored-token' } } });
  await operation;
  assert.equal(app.calls[0].headers.get('authorization'), 'Bearer restored-token');
  assert.equal(app.calls[0].headers.get('content-type'), 'application/json');
  assert.equal(app.calls[0].init.method, 'DELETE');
  assert.equal(app.calls[0].init.body, '{"ids":["fixture"]}');
});

test('each request obtains refreshed session; signed-out request has no stale bearer', async () => {
  let token = 'first';
  const app = browser(async () => ({ data: { session: token ? { access_token: token } : null } }));
  await app.pdmFetch('/api/session'); token = 'refreshed';
  await app.pdmFetch('/api/admin/reports'); token = '';
  await app.pdmFetch('/api/session');
  assert.deepEqual(app.calls.map(call => call.headers.get('authorization')), ['Bearer first', 'Bearer refreshed', null]);
});

test('explicit authorization and Request/init headers are retained without reading session', async () => {
  const app = browser(() => { throw new Error('Session should not be read'); });
  const request = new Request('https://purposedrivenmedia.group/api/session', { headers: { authorization: 'Bearer explicit', 'x-request': 'kept', 'x-override': 'old' } });
  await app.pdmFetch(request, { headers: { 'x-override': 'new' } });
  assert.equal(app.calls[0].headers.get('authorization'), 'Bearer explicit');
  assert.equal(app.calls[0].headers.get('x-request'), 'kept');
  assert.equal(app.calls[0].headers.get('x-override'), 'new');
});

test('external origins, protocol-relative URLs, and non-API paths never receive session token', async () => {
  const app = browser(() => { throw new Error('Token read outside PDM API'); });
  for (const url of ['https://other.example/api/reports', '//other.example/api/reports', '/business/report/fixture']) await app.pdmFetch(url);
  assert.ok(app.calls.every(call => !call.headers.has('authorization')));
});

test('session restore failure fails closed before fetch', async () => {
  const app = browser(async () => ({ data: {}, error: new Error('expired') }));
  await assert.rejects(app.pdmFetch('/api/session'), /session could not be restored/);
  assert.equal(app.calls.length, 0);
});

function actors({ supabaseEmail = 'member@example.org', authStatus = 200, chatEmail = OWNER, authThrow = false, userId = '7a7e7829-9f65-4eb8-9f59-f5b0edfa490a', emailConfirmedAt = '2026-09-24T12:00:00Z' } = {}) {
  let chatCalls = 0;
  const imports = {
    'cloudflare:workers': { env: {} },
    '../app/chatgpt-auth': { getChatGPTUser: async () => { chatCalls++; return chatEmail ? { email: chatEmail, fullName: null } : null; } },
    './pdm-gateway': { signGateway: () => { throw new Error('Unexpected gateway request'); } },
    './supabase-config': { supabaseUrl: 'https://auth.example', supabasePublishableKey: 'public-fixture' },
  };
  const module = load('lib/portal-service.ts', imports, { fetch: async (_url, init) => {
    assert.equal(init.headers.authorization, 'Bearer fixture');
    if (authThrow) throw new Error('auth unavailable');
    return Response.json({ id: userId, email: supabaseEmail, email_confirmed_at: emailConfirmedAt, user_metadata: { admin: true, email: OWNER, display_name: 'Fixture' } }, { status: authStatus });
  } });
  return { ...module, chatCalls: () => chatCalls };
}

test('explicit invalid/malformed/unavailable bearer never falls back to ChatGPT owner', async () => {
  for (const options of [{ authStatus: 401 }, { authThrow: true }]) {
    const auth = actors(options);
    assert.equal(await auth.getRequestActor('Bearer fixture'), null);
    assert.equal(auth.chatCalls(), 0);
  }
  const auth = actors();
  assert.equal(await auth.getRequestActor('Basic forged'), null);
  assert.equal(auth.chatCalls(), 0);
});

test('Supabase identity takes precedence over ChatGPT owner and editable metadata', async () => {
  const auth = actors({ supabaseEmail: ' MEMBER@EXAMPLE.ORG ' });
  const actor = await auth.getRequestActor('Bearer fixture');
  assert.equal(actor.email, 'member@example.org');
  assert.equal(auth.chatCalls(), 0);
  assert.equal((await auth.getRequestActor('')).email, OWNER);
  assert.equal(auth.chatCalls(), 1);
});

function session(auth) {
  return load('app/api/session/route.ts', {
    '../../../lib/portal-service': auth,
    '../../../lib/owner-config': { PDM_OWNER_EMAIL: OWNER },
  });
}
const request = (path, token = 'Bearer fixture') => new Request(`https://purposedrivenmedia.group${path}`, { headers: token ? { authorization: token } : {} });

test('session endpoint verifies owner/member/signed-out and keeps responses private', async () => {
  for (const [options, expectedStatus, expectedAdmin] of [[{ supabaseEmail: OWNER }, 200, true], [{}, 200, false], [{ authStatus: 401 }, 401, undefined]]) {
    const response = await session(actors(options)).GET(request('/api/session'));
    assert.equal(response.status, expectedStatus);
    assert.equal((await response.json()).admin, expectedAdmin);
    assert.match(response.headers.get('cache-control'), /private, no-store/);
  }
});

function reports(auth, outcomes = {}) {
  const calls = [];
  const business = { businesses: { id: 'business-id', updatedAt: 'updated' }, screenings: { id: 'screening-id', businessId: 'business-id', createdAt: 'created' } };
  const organization = { screenings: { createdAt: 'org-created' }, appointments: { createdAt: 'appointment-created' } };
  return { calls, ...load('app/api/admin/reports/route.ts', {
    'drizzle-orm': { eq: (...values) => values, desc: value => value },
    '../../../../lib/portal-service': auth,
    '../../../../lib/owner-config': { PDM_OWNER_EMAIL: OWNER },
    '../../../../modules/business/db/schema': business,
    '../../../../modules/organization/db/schema': organization,
    '../../../../lib/portal-db': { portalDb(service, _schema, authorization) {
      calls.push({ service, authorization });
      return { select() {
        let table;
        const query = {
          from(value) { table = value; return query; }, leftJoin() { return query; },
          orderBy() {
            const key = service === 'business' ? 'business' : table === organization.screenings ? 'organization' : 'meetings';
            const result = outcomes[key] || [];
            return result instanceof Error ? Promise.reject(result) : Promise.resolve(result);
          },
        };
        return query;
      } };
    } },
  }) };
}

test('admin reports rejects unsigned and nonowner requests before touching either database', async () => {
  for (const [options, status] of [[{ authStatus: 401 }, 401], [{}, 403]]) {
    const route = reports(actors(options));
    assert.equal((await route.GET(request('/api/admin/reports'))).status, status);
    assert.equal(route.calls.length, 0);
  }
});

test('admin reports keeps full business history and empty businesses; organization/meeting failures are independent', async () => {
  const fixtureBusiness = { id: 7, name: 'Fixture business' };
  const history = Array.from({ length: 15 }, (_, index) => ({ id: 30 - index, publicId: `fixture-${index}`, totalScore: 60 + index }));
  const route = reports(actors({ supabaseEmail: OWNER }), {
    business: [...history.map(screening => ({ business: fixtureBusiness, screening })), { business: { id: 8, name: 'Empty fixture' }, screening: null }],
    organization: new Error('organization unavailable'), meetings: [{ id: 'meeting-fixture' }],
  });
  const response = await route.GET(request('/api/admin/reports'));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
  const body = await response.json();
  assert.equal(body.clients.length, 2);
  assert.deepEqual(body.clients[0].history, history);
  assert.deepEqual(body.clients[1].history, []);
  assert.deepEqual(body.ministryScreenings, []);
  assert.equal(body.appointments[0].id, 'meeting-fixture');
  assert.deepEqual(body.availability, { business: true, organization: false, meetings: true });
  assert.deepEqual(route.calls, [{ service: 'business', authorization: 'Bearer fixture' }, { service: 'organization', authorization: 'Bearer fixture' }]);
});

test('business/meeting outages do not hide available organization reports', async () => {
  const route = reports(actors({ supabaseEmail: OWNER }), { business: new Error('business unavailable'), organization: [{ id: 'ministry-fixture' }, { id: 'nonprofit-fixture' }], meetings: new Error('calendar unavailable') });
  const body = await (await route.GET(request('/api/admin/reports'))).json();
  assert.deepEqual(body.clients, []);
  assert.equal(body.ministryScreenings.length, 2);
  assert.deepEqual(body.availability, { business: false, organization: true, meetings: false });
});


test('unconfirmed Supabase email never grants owner privileges or falls back to ChatGPT owner', async () => {
  for (const emailConfirmedAt of [undefined, null, '', false, 'not-a-date']) {
    // Undefined must be encoded as a missing field, not use the fixture default.
    const auth = actors({ supabaseEmail: OWNER, emailConfirmedAt: emailConfirmedAt === undefined ? null : emailConfirmedAt });
    assert.equal(await auth.getRequestActor('Bearer fixture'), null);
    assert.equal((await session(auth).GET(request('/api/session'))).status, 401);
    assert.equal(auth.chatCalls(), 0);
  }
});

test('missing or malformed Supabase user UUID is denied before owner authorization', async () => {
  for (const userId of [null, '', false, 'owner', '00000000-0000-invalid']) {
    const auth = actors({ supabaseEmail: OWNER, userId });
    assert.equal(await auth.getRequestActor('Bearer fixture'), null);
    const route = reports(auth);
    assert.equal((await route.GET(request('/api/admin/reports'))).status, 401);
    assert.equal(route.calls.length, 0);
  }
});

test('fresh Supabase user with confirmed email and UUID retains canonical identity', async () => {
  const userId = '7a7e7829-9f65-4eb8-9f59-f5b0edfa490a';
  const auth = actors({ supabaseEmail: OWNER, userId });
  const actor = await auth.getRequestActor('Bearer fixture');
  assert.equal(actor.id, userId);
  assert.equal(actor.email, OWNER);
  assert.equal((await session(auth).GET(request('/api/session'))).status, 200);
});

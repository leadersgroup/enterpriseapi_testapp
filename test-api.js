#!/usr/bin/env node

// 50Deeds Enterprise API v4.0 test suite (sandbox).
//
// Transport note: the v4.0 reference documents REST-style URLs
// (GET /functions/enterpriseApi/pricing/FL/Miami-Dade?deed_type=...), but Base44
// does not route sub-paths to a function — those URLs return 404
// "Backend function 'enterpriseApi/pricing/...' not found". So every call is a
// POST to the function root with the logical path/method in the body (_path,
// _method). Query params for GETs go in the body too. Auth uses the documented
// Authorization: Bearer header.

const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = process.env.API_HOST || 'https://50-deeds-enterprise-testenv-385a4bcc.base44.app';
const API_KEY = process.env.API_KEY || 'c24398ff06861986a415b4b44b89b0fc29caecb7f045113c797b20f086b3b87a';
const API_URL = `${HOST}/functions/enterpriseApi`;
const UPLOAD_URL = `${HOST}/functions/uploadDocument`;

function httpRequest(url, headers, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function api(method, apiPath, params = {}) {
  const body = { _path: apiPath, _method: method, ...params };
  console.log(`\n${'='.repeat(70)}`);
  console.log(`REQUEST: ${method} ${apiPath}`);
  console.log(`POST ${API_URL}`);
  console.log(`Authorization: Bearer ***${API_KEY.slice(-8)}`);
  console.log(JSON.stringify(body, null, 2));
  const res = await httpRequest(
    API_URL,
    { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    JSON.stringify(body)
  );
  console.log(`\nRESPONSE ${res.status}`);
  console.log(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
  return res;
}

async function upload(filePath, orderId) {
  const boundary = '----50deeds' + Date.now();
  const parts = [
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\n` +
      `Content-Type: application/pdf\r\n\r\n`
    ),
    fs.readFileSync(filePath),
    Buffer.from('\r\n'),
  ];
  if (orderId) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="order_id"\r\n\r\n${orderId}\r\n`));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const payload = Buffer.concat(parts);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`REQUEST: POST ${UPLOAD_URL} (multipart, order_id=${orderId || '-'})`);
  const res = await httpRequest(
    UPLOAD_URL,
    { 'Content-Type': `multipart/form-data; boundary=${boundary}`, Authorization: `Bearer ${API_KEY}`, 'Content-Length': payload.length },
    payload
  );
  console.log(`\nRESPONSE ${res.status}`);
  console.log(JSON.stringify(res.data, null, 2));
  return res;
}

const results = [];
function check(name, res, expected, extra = true) {
  const ok = expected.includes(res.status) && extra;
  console.log(`\n${ok ? '✓ PASS' : '✗ FAIL'}: ${name} (expected ${expected.join('/')}, got ${res.status})`);
  results.push({ name, pass: ok });
  return ok;
}

function baseOrder(overrides = {}) {
  return {
    deed_type: 'Individual to Trust',
    property_address: '123 Main St, Miami, FL 33101',
    grantor_name: 'John Doe, individually',
    grantee_name: 'John Doe, Trustee of the Doe Family Trust dated 01/15/2026',
    contact_name: 'John Doe',
    contact_email: 'test@example.com',
    county: 'Miami-Dade',
    state: 'FL',
    additional_instructions: 'Automated sandbox test order',
    client_reference: `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...overrides,
  };
}

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    console.error(`✗ FAIL: ${name} - ${e.message}`);
    results.push({ name, pass: false });
  }
}

async function run() {
  console.log(`\n${'█'.repeat(70)}\n50Deeds Enterprise API v4.0 Test Suite\nHost: ${HOST}\n${'█'.repeat(70)}`);
  let orderId = null;
  let webhookId = null;

  await step('Pricing: FL/Miami-Dade, FinCEN reportable', async () => {
    const r = await api('GET', '/pricing/FL/Miami-Dade', {
      deed_type: 'Transfer from entity to Trust: FinCEN reportable',
    });
    check('Pricing: FL/Miami-Dade, FinCEN reportable', r, [200], r.data?.fincen_required === true);
  });

  await step('Pricing: FL/Walton, Individual to Individual', async () => {
    const r = await api('GET', '/pricing/FL/Walton', { deed_type: 'Individual to Individual' });
    check('Pricing: FL/Walton, Individual to Individual', r, [200], typeof r.data?.total === 'number');
  });

  await step('List orders', async () => {
    const r = await api('GET', '/orders', { state: 'FL' });
    check('List orders', r, [200], Array.isArray(r.data?.orders));
  });

  await step('Order history (paginated)', async () => {
    const r = await api('GET', '/orders/history', { limit: 5, sort_by: 'created_date', sort_dir: 'desc' });
    check('Order history (paginated)', r, [200], !!r.data?.pagination);
  });

  // Create + idempotency lookup by client_reference
  const order = baseOrder();
  await step('Create order (FL, no SSN)', async () => {
    const r = await api('POST', '/orders', order);
    if (check('Create order (FL, no SSN)', r, [201], !!r.data?.order?.id)) orderId = r.data.order.id;
  });

  await step('Lookup by client_reference', async () => {
    const r = await api('GET', '/orders', { client_reference: order.client_reference });
    check('Lookup by client_reference', r, [200], r.data?.orders?.length === 1);
  });

  await step('Get specific order', async () => {
    const r = await api('GET', `/orders/${orderId || 'invalid-id'}`);
    check('Get specific order', r, [200], r.data?.id === orderId);
  });

  await step('Upload document to order', async () => {
    const tmp = path.join(require('os').tmpdir(), `50deeds-test-${Date.now()}.pdf`);
    fs.writeFileSync(tmp, '%PDF-1.4\n% 50deeds sandbox test\n');
    const r = await upload(tmp, orderId);
    fs.unlinkSync(tmp);
    check('Upload document to order', r, [200, 201], !!r.data?.file_url);
  });

  await step('NY order without SSNs -> 400', async () => {
    const r = await api('POST', '/orders', baseOrder({
      property_address: '500 5th Ave, New York, NY 10110', county: 'New York', state: 'NY',
    }));
    check('NY order without SSNs -> 400', r, [400], /ssn/i.test(JSON.stringify(r.data)));
  });

  await step('NY order with SSNs', async () => {
    const r = await api('POST', '/orders', baseOrder({
      deed_type: 'Individual to Company',
      property_address: '500 5th Ave, New York, NY 10110', county: 'New York', state: 'NY',
      grantor_ssn: '123-45-6789', grantee_ssn: '987-65-4321',
    }));
    check('NY order with SSNs', r, [201]);
  });

  // Old spellings (lowercase third word, " (Legacy)" suffix) are still accepted and
  // stored in the canonical form.
  await step('Old spelling stored as "Individual to Individual"', async () => {
    const created = await api('POST', '/orders', baseOrder({ deed_type: 'Individual to individual' }));
    const id = created.data?.order?.id;
    const r = id ? await api('GET', `/orders/${id}`) : created;
    check('Old spelling stored as "Individual to Individual"', r, [200], r.data?.deed_type === 'Individual to Individual');
  });

  await step('Malformed order -> 400', async () => {
    const r = await api('POST', '/orders', { deed_type: 'Individual to Individual' });
    check('Malformed order -> 400', r, [400], !!r.data?.error);
  });

  await step('Register webhook', async () => {
    const r = await api('POST', '/webhooks/register', {
      url: 'https://example.com/webhooks/50deeds', description: 'Automated test',
    });
    if (check('Register webhook', r, [201], !!r.data?.webhook?.id)) webhookId = r.data.webhook.id;
  });

  await step('Delete webhook', async () => {
    const r = await api('DELETE', `/webhooks/${webhookId || 'wh_missing'}`);
    check('Delete webhook', r, [200], r.data?.success === true);
  });

  console.log(`\n${'█'.repeat(70)}\nTEST SUMMARY\n${'█'.repeat(70)}`);
  results.forEach((r) => console.log(`${r.pass ? '✓' : '✗'} ${r.name}`));
  const passed = results.filter((r) => r.pass).length;
  console.log(`\nTotal: ${passed}/${results.length} passed\n`);
  process.exit(passed === results.length ? 0 : 1);
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

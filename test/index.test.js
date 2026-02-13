const assert = require('assert');
const app = require('../src/index');
const { resetAll } = require('../src/store');

async function runTests() {
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)); });
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  let passed = 0, failed = 0;
  async function test(name, fn) { try { await fn(); passed++; } catch (err) { failed++; console.error(`FAIL: ${name} — ${err.message}`); } }

  resetAll();

  await test('GET /health', async () => {
    const r = await fetch(`${base}/health`);
    assert.strictEqual(r.status, 200);
  });

  // Test all 15 resources: POST + GET list + GET by id
  const resources = ['users', 'products', 'orders', 'invoices', 'payments', 'shipments', 'reviews', 'categories', 'tags', 'coupons', 'inventory', 'suppliers', 'warehouses', 'reports', 'analytics'];
  
  for (const res of resources) {
    await test(`POST /api/${res}`, async () => {
      const r = await fetch(`${base}/api/${res}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Test ${res}`, value: Math.random() }),
      });
      assert.strictEqual(r.status, 201);
    });

    await test(`GET /api/${res}`, async () => {
      const r = await fetch(`${base}/api/${res}`);
      assert.strictEqual(r.status, 200);
      const d = await r.json();
      assert.ok(d.length >= 1);
    });

    await test(`GET /api/${res}/1`, async () => {
      const r = await fetch(`${base}/api/${res}/1`);
      assert.strictEqual(r.status, 200);
    });
  }

  // Wildcard tests
  await test('GET /api/search/*', async () => {
    const r = await fetch(`${base}/api/search/Test`);
    assert.strictEqual(r.status, 200);
    const d = await r.json();
    assert.ok(d.length >= 1);
  });

  await test('GET /api/export/csv', async () => {
    const r = await fetch(`${base}/api/export/csv`);
    assert.strictEqual(r.status, 200);
  });

  await test('GET /docs/api', async () => {
    const r = await fetch(`${base}/docs/api`);
    assert.strictEqual(r.status, 200);
  });

  await test('POST /webhooks/stripe', async () => {
    const r = await fetch(`${base}/webhooks/stripe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.success' }),
    });
    assert.strictEqual(r.status, 200);
  });

  await test('GET /unknown returns 404', async () => {
    const r = await fetch(`${base}/unknown`);
    assert.strictEqual(r.status, 404);
  });

  server.close();
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => { console.error(err); process.exit(1); });

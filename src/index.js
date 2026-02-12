const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => { res.json({ status: 'ok', host: req.host }); });

// Mount 15 route modules
const resources = ['users', 'products', 'orders', 'invoices', 'payments', 'shipments', 'reviews', 'categories', 'tags', 'coupons', 'inventory', 'suppliers', 'warehouses', 'reports', 'analytics'];
resources.forEach(r => app.use(`/api/${r}`, require(`./routes/${r}`)));

// Search wildcard — /api/search/* (breaks in Express 5)
app.get('/api/search/*', (req, res) => {
  const query = req.url.replace('/api/search/', '').toLowerCase();
  const { getStore } = require('./store');
  const results = [];
  resources.forEach(r => {
    const items = getStore(r).filter(i => JSON.stringify(i).toLowerCase().includes(query));
    results.push(...items.map(i => ({ ...i, _resource: r })));
  });
  res.json(results);
});

// Export wildcard — /api/export/* (breaks in Express 5)
app.get('/api/export/*', (req, res) => {
  const format = req.url.replace('/api/export/', '') || 'json';
  res.json({ format, resources: resources.length });
});

// Docs — /docs/* (breaks in Express 5)
app.get('/docs/*', (req, res) => { res.json({ topic: req.url }); });

// Webhooks — /webhooks/* (breaks in Express 5)
app.post('/webhooks/*', (req, res) => { res.json({ received: true, path: req.url }); });

// 404 catch-all
app.all('*', (req, res) => { res.json(404, { error: 'Not found' }); });

if (require.main === module) { app.listen(3000, () => console.log('Server on :3000')); }
module.exports = app;

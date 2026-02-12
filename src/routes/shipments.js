const { Router } = require('express');
const { getStore } = require('../store');
const router = Router();
const store = getStore('shipments');

// :id? optional param — breaks in Express 5
router.get('/:id?', (req, res) => {
  if (req.params.id) {
    const item = store.getById(req.params.id);
    return item ? res.json(item) : res.send(404);
  }
  res.json(store.getAll());
});

router.post('/', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.json(400, { error: 'body required' });
  res.status(201).json(store.create(req.body));
});

router.put('/:id', (req, res) => {
  const item = store.update(req.params.id, req.body);
  item ? res.json(item) : res.send(404);
});

router.delete('/:id', (req, res) => {
  store.remove(req.params.id) ? res.json({ ok: true }) : res.send(404);
});

module.exports = router;

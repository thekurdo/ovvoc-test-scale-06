const collections = {};
const counters = {};

function getStore(name) {
  if (!collections[name]) { collections[name] = []; counters[name] = 0; }
  return {
    getAll: () => collections[name].slice(),
    getById: (id) => collections[name].find(i => i.id === parseInt(id)),
    create: (item) => { const i = { id: ++counters[name], ...item, createdAt: new Date().toISOString() }; collections[name].push(i); return i; },
    update: (id, updates) => { const i = collections[name].find(x => x.id === parseInt(id)); if (!i) return null; Object.assign(i, updates); return i; },
    remove: (id) => { const idx = collections[name].findIndex(x => x.id === parseInt(id)); if (idx === -1) return false; collections[name].splice(idx, 1); return true; },
    filter: (fn) => collections[name].filter(fn),
    count: () => collections[name].length,
    reset: () => { collections[name] = []; counters[name] = 0; },
  };
}

function resetAll() { Object.keys(collections).forEach(k => { collections[k] = []; counters[k] = 0; }); }

module.exports = { getStore, resetAll };

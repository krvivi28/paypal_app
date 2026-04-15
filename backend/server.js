const http = require('http');
const url = require('url');
const crypto = require('crypto');

// ─── In-memory data store ─────────────────────────────────────────────────────
let transactions = Array.from({ length: 50 }, (_, i) => ({
  id: crypto.randomUUID(),
  description: ['Netflix Subscription','Amazon Purchase','Spotify Premium','Apple Store','Uber Ride','Zomato Order','Swiggy','Google Pay','Salary Credit','Rent Payment'][i % 10],
  amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)),
  type: i % 3 === 0 ? 'CREDIT' : 'DEBIT',
  status: ['COMPLETED','PENDING','FAILED'][i % 3],
  category: ['Food','Shopping','Entertainment','Travel','Utilities'][i % 5],
  date: new Date(Date.now() - i * 86400000).toISOString(),
  currency: 'USD',
}));

// ─── Auth ─────────────────────────────────────────────────────────────────────
const USERS = { admin: 'password123', user: 'user123' };
const tokens = new Map();

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5000;
const getCache = (k) => { const e = cache.get(k); if (!e || Date.now() - e.ts > CACHE_TTL) { cache.delete(k); return null; } return e.data; };
const setCache = (k, d) => cache.set(k, { data: d, ts: Date.now() });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); } });
  });
}

function authenticate(req) {
  const t = (req.headers['authorization'] || '').replace('Bearer ', '');
  return tokens.get(t) || null;
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip) || { count: 0, reset: now + 60000 };
  if (now > e.reset) { e.count = 0; e.reset = now + 60000; }
  e.count++; rateMap.set(ip, e);
  return e.count > 100;
}

// ─── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const ip = req.socket.remoteAddress;
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (isRateLimited(ip)) return sendJSON(res, 429, { error: 'Too Many Requests (100/min)' });

  const { pathname, query: qs } = url.parse(req.url, true);

  // POST /auth/login
  if (pathname === '/auth/login' && req.method === 'POST') {
    const { username, password } = await readBody(req);
    if (!USERS[username] || USERS[username] !== password) return sendJSON(res, 401, { error: 'Invalid credentials' });
    const token = crypto.randomBytes(32).toString('hex');
    tokens.set(token, { username, role: username === 'admin' ? 'ADMIN' : 'USER' });
    return sendJSON(res, 200, { token, username, role: username === 'admin' ? 'ADMIN' : 'USER' });
  }

  // POST /auth/logout
  if (pathname === '/auth/logout' && req.method === 'POST') {
    const t = (req.headers['authorization'] || '').replace('Bearer ', '');
    tokens.delete(t);
    return sendJSON(res, 200, { message: 'Logged out' });
  }

  const user = authenticate(req);
  if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

  // GET /transactions
  if (pathname === '/transactions' && req.method === 'GET') {
    const cached = getCache(req.url);
    if (cached) { res.setHeader('X-Cache', 'HIT'); return sendJSON(res, 200, cached); }

    let result = [...transactions];
    if (qs.type) result = result.filter(t => t.type === qs.type.toUpperCase());
    if (qs.status) result = result.filter(t => t.status === qs.status.toUpperCase());
    if (qs.category) result = result.filter(t => t.category === qs.category);
    if (qs.search) { const s = qs.search.toLowerCase(); result = result.filter(t => t.description.toLowerCase().includes(s)); }

    const order = qs.order === 'asc' ? 1 : -1;
    result.sort((a, b) => qs.sortBy === 'amount' ? order * (a.amount - b.amount) : order * (new Date(a.date) - new Date(b.date)));

    const page = parseInt(qs.page) || 1, limit = parseInt(qs.limit) || 10;
    const total = result.length, totalPages = Math.ceil(total / limit);
    const data = result.slice((page - 1) * limit, page * limit);
    const response = { data, meta: { total, page, limit, totalPages } };
    setCache(req.url, response);
    return sendJSON(res, 200, response);
  }

  const match = pathname.match(/^\/transactions\/([^/]+)$/);

  // GET /transactions/:id
  if (match && req.method === 'GET') {
    const tx = transactions.find(t => t.id === match[1]);
    return tx ? sendJSON(res, 200, tx) : sendJSON(res, 404, { error: 'Not found' });
  }

  // POST /transactions
  if (pathname === '/transactions' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.description || !body.amount || !body.type) return sendJSON(res, 400, { error: 'description, amount, type required' });
    const tx = { id: crypto.randomUUID(), ...body, amount: parseFloat(body.amount), type: body.type.toUpperCase(), status: 'PENDING', date: new Date().toISOString(), currency: 'USD' };
    transactions.unshift(tx); cache.clear();
    return sendJSON(res, 201, tx);
  }

  // PUT /transactions/:id
  if (match && req.method === 'PUT') {
    const idx = transactions.findIndex(t => t.id === match[1]);
    if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
    const body = await readBody(req);
    transactions[idx] = { ...transactions[idx], ...body, id: transactions[idx].id, amount: parseFloat(body.amount) };
    cache.clear();
    return sendJSON(res, 200, transactions[idx]);
  }

  // DELETE /transactions/:id (admin only)
  if (match && req.method === 'DELETE') {
    if (user.role !== 'ADMIN') return sendJSON(res, 403, { error: 'Forbidden: Admin only' });
    const idx = transactions.findIndex(t => t.id === match[1]);
    if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
    const [deleted] = transactions.splice(idx, 1); cache.clear();
    return sendJSON(res, 200, { message: 'Deleted', transaction: deleted });
  }

  // GET /summary
  if (pathname === '/summary' && req.method === 'GET') {
    const credit = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const debit = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
    return sendJSON(res, 200, {
      totalTransactions: transactions.length,
      totalCredit: +credit.toFixed(2),
      totalDebit: +debit.toFixed(2),
      balance: +(credit - debit).toFixed(2),
      byStatus: {
        COMPLETED: transactions.filter(t => t.status === 'COMPLETED').length,
        PENDING: transactions.filter(t => t.status === 'PENDING').length,
        FAILED: transactions.filter(t => t.status === 'FAILED').length,
      },
    });
  }

  sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(4000, () => {
  console.log('\n✅  Mock API → http://localhost:4000');
  console.log('   admin / password123  |  user / user123\n');
});

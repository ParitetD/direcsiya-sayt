const express = require('express');
const router = express.Router();
const fs = require('fs');
const { verifyToken } = require('./auth');

const FILE = 'data/contacts.json';

function read() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
}
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Заполните обязательные поля: name, email, message' });
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  const MAX_CONTACTS = 500;
  let items = read();
  items.unshift({
    id: Date.now().toString(),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    subject: String(subject || '').slice(0, 300),
    message: String(message).slice(0, 2000),
    read: false,
    createdAt: new Date().toISOString()
  });
  // Keep only the most recent MAX_CONTACTS entries to prevent unbounded growth
  if (items.length > MAX_CONTACTS) items = items.slice(0, MAX_CONTACTS);
  write(items);
  res.json({ success: true });
});

router.get('/', verifyToken, (req, res) => {
  const items = read();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  res.json({ data: items.slice(offset, offset + limit), total: items.length, page, limit });
});

router.patch('/:id/read', verifyToken, (req, res) => {
  const items = read();
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Не найдено' });
  item.read = true;
  write(items);
  res.json({ success: true });
});

router.delete('/:id', verifyToken, (req, res) => {
  const items = read();
  const idx = items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  items.splice(idx, 1);
  write(items);
  res.json({ success: true });
});

module.exports = router;

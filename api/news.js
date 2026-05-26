const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('./auth');

const FILE = 'data/news.json';
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/news/',
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /image/.test(file.mimetype))
});

function read() { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => {
  let items = read();
  const { search, status, page = 1, limit = 20 } = req.query;
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(n =>
      (n.titleRu || '').toLowerCase().includes(s) ||
      (n.titleKy || '').toLowerCase().includes(s)
    );
  }
  if (status) items = items.filter(n => n.status === status);
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = items.length;
  const start = (Number(page) - 1) * Number(limit);
  res.json({ data: items.slice(start, start + Number(limit)), total });
});

router.get('/:id', (req, res) => {
  const item = read().find(n => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Не найдено' });
  res.json(item);
});

router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const items = read();
  const item = {
    id: Date.now().toString(),
    titleRu: req.body.titleRu || '',
    titleKy: req.body.titleKy || '',
    contentRu: req.body.contentRu || '',
    contentKy: req.body.contentKy || '',
    category: req.body.category || 'news',
    status: req.body.status || 'draft',
    image: req.file ? `/uploads/news/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.unshift(item);
  write(items);
  res.status(201).json(item);
});

router.put('/:id', verifyToken, upload.single('image'), (req, res) => {
  const items = read();
  const idx = items.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const updated = { ...items[idx], ...req.body, updatedAt: new Date().toISOString() };
  if (req.file) updated.image = `/uploads/news/${req.file.filename}`;
  items[idx] = updated;
  write(items);
  res.json(items[idx]);
});

router.delete('/:id', verifyToken, (req, res) => {
  const items = read();
  const idx = items.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  items.splice(idx, 1);
  write(items);
  res.json({ success: true });
});

module.exports = router;

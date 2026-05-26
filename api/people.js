const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('./auth');

const FILE = 'data/people.json';
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/people/',
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /image/.test(file.mimetype))
});

function read() { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => {
  let items = read();
  const { search, role, page = 1, limit = 20 } = req.query;
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(n =>
      (n.nameRu || '').toLowerCase().includes(s) ||
      (n.nameKy || '').toLowerCase().includes(s)
    );
  }
  if (role) items = items.filter(n => n.role === role);
  items.sort((a, b) => (a.order || 0) - (b.order || 0));
  const total = items.length;
  const start = (Number(page) - 1) * Number(limit);
  res.json({ data: items.slice(start, start + Number(limit)), total });
});

router.get('/:id', (req, res) => {
  const item = read().find(n => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Не найдено' });
  res.json(item);
});

router.post('/', verifyToken, upload.single('photo'), (req, res) => {
  const items = read();
  const item = {
    id: Date.now().toString(),
    nameRu: req.body.nameRu || '',
    nameKy: req.body.nameKy || '',
    role: req.body.role || 'athlete',
    titleRu: req.body.titleRu || '',
    titleKy: req.body.titleKy || '',
    sportRu: req.body.sportRu || '',
    sportKy: req.body.sportKy || '',
    bioRu: req.body.bioRu || '',
    bioKy: req.body.bioKy || '',
    achievements: req.body.achievements || '',
    order: Number(req.body.order) || items.length + 1,
    photo: req.file ? `/uploads/people/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.push(item);
  write(items);
  res.status(201).json(item);
});

router.put('/:id', verifyToken, upload.single('photo'), (req, res) => {
  const items = read();
  const idx = items.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const updated = { ...items[idx], ...req.body, updatedAt: new Date().toISOString() };
  if (req.body.order) updated.order = Number(req.body.order);
  if (req.file) updated.photo = `/uploads/people/${req.file.filename}`;
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

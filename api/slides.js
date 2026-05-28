const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('./auth');

const FILE = 'data/slides.json';

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/slides/',
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /image/.test(file.mimetype))
});

function read() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => {
  let items = read();
  const { active } = req.query;
  if (active === 'true') items = items.filter(s => s.active === true);
  items.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ data: items, total: items.length });
});

router.get('/:id', (req, res) => {
  const item = read().find(s => s.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Не найдено' });
  res.json(item);
});

router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const items = read();
  const item = {
    id: Date.now().toString(),
    titleRu: req.body.titleRu || '',
    titleKy: req.body.titleKy || '',
    subtitleRu: req.body.subtitleRu || '',
    subtitleKy: req.body.subtitleKy || '',
    order: Number(req.body.order) || items.length + 1,
    active: req.body.active !== 'false',
    image: req.file ? `/uploads/slides/${req.file.filename}` : (req.body.imageUrl || req.body.image || ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.push(item);
  write(items);
  res.status(201).json(item);
});

router.put('/:id', verifyToken, upload.single('image'), (req, res) => {
  const items = read();
  const idx = items.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const updated = { ...items[idx], ...req.body, updatedAt: new Date().toISOString() };
  if (req.body.order !== undefined) updated.order = Number(req.body.order);
  if (req.body.active !== undefined) updated.active = req.body.active === 'true' || req.body.active === true;
  if (req.file) updated.image = `/uploads/slides/${req.file.filename}`;
  else if (req.body.imageUrl) updated.image = req.body.imageUrl;
  items[idx] = updated;
  write(items);
  res.json(items[idx]);
});

router.delete('/:id', verifyToken, (req, res) => {
  const items = read();
  const idx = items.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  items.splice(idx, 1);
  write(items);
  res.json({ success: true });
});

module.exports = router;

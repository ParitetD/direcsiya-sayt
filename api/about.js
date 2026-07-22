const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('./auth');
const createCRUD = require('./crud');

const UPLOAD_DIR = 'uploads/about/';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `history-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, /^image\//.test(file.mimetype) && ['.jpg','.jpeg','.png','.webp','.gif'].includes(ext));
  },
});

const HISTORY_FILE = 'data/about.json';
function readHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return {}; }
}
function writeHistory(d) { fs.writeFileSync(HISTORY_FILE, JSON.stringify(d, null, 2)); }

router.get('/history', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(readHistory());
});

router.put('/history', verifyToken, (req, res) => {
  const str = (v, max) => v != null ? String(v).trim().slice(0, max) : undefined;
  const current = readHistory();
  const updated = { ...current };
  ['historyPara1Ru','historyPara1Ky','historyPara2Ru','historyPara2Ky','historyPara3Ru','historyPara3Ky'].forEach(k => {
    const v = str(req.body[k], 2000);
    if (v !== undefined) updated[k] = v;
  });
  if (req.body.historyImageUrl !== undefined) {
    updated.historyImageUrl = String(req.body.historyImageUrl || '').slice(0, 500);
  }
  writeHistory(updated);
  res.json(updated);
});

router.post('/image', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const url = `/uploads/about/${req.file.filename}`;
  const current = readHistory();
  writeHistory({ ...current, historyImageUrl: url });
  res.json({ url });
});

router.use('/values', createCRUD({
  file: 'data/about-values.json',
  defaultSort: (a, b) => Number(a.order || 0) - Number(b.order || 0),
  bodyFields: ['titleRu','titleKy','textRu','textKy','order'],
  searchFields: ['titleRu','titleKy'],
}));

const timelineUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `timeline-${Date.now()}-${Math.random().toString(36).slice(2,7)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, /^image\//.test(file.mimetype) && ['.jpg','.jpeg','.png','.webp','.gif'].includes(ext));
  },
});

const timelineCrud = createCRUD({
  file: 'data/about-timeline.json',
  defaultSort: (a, b) => Number(a.year || 0) - Number(b.year || 0),
  bodyFields: ['year','titleRu','titleKy','descRu','descKy','fullDescRu','fullDescKy','order'],
  searchFields: ['titleRu','titleKy','year'],
});
router.use('/timeline', timelineCrud);

function readTimeline() {
  try { return JSON.parse(fs.readFileSync('data/about-timeline.json', 'utf8')); } catch { return []; }
}
function writeTimeline(d) { fs.writeFileSync('data/about-timeline.json', JSON.stringify(d, null, 2)); }

router.post('/timeline/:id/add-photo', verifyToken, timelineUpload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const items = readTimeline();
  const idx = items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const url = `/uploads/about/${req.file.filename}`;
  if (!Array.isArray(items[idx].photos)) items[idx].photos = [];
  items[idx].photos.push(url);
  writeTimeline(items);
  res.json({ url, photos: items[idx].photos });
});

router.delete('/timeline/:id/remove-photo', verifyToken, (req, res) => {
  const items = readTimeline();
  const idx = items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: 'Не указан url' });
  items[idx].photos = (items[idx].photos || []).filter(p => p !== url);
  writeTimeline(items);
  res.json({ photos: items[idx].photos });
});

module.exports = router;

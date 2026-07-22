const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const createCRUD  = require('./crud');
const { verifyToken } = require('./auth');

function readSports() {
  try { return JSON.parse(fs.readFileSync('data/sports.json', 'utf8')); } catch { return []; }
}
function writeSports(d) { fs.writeFileSync('data/sports.json', JSON.stringify(d, null, 2)); }

/* ── CRUD base ── */
const crudRouter = createCRUD({
  file:         'data/sports.json',
  uploadDir:    'uploads/sports/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['nameRu', 'nameKy'],
  filterFields: ['status'],
  bodyFields:   [
    'nameRu', 'nameKy',
    'descriptionRu', 'descriptionKy',
    'fullDescRu', 'fullDescKy',
    'athletesCount', 'order', 'status',
    'image', 'icon',
  ],
  defaultSort: (a, b) => (a.order || 0) - (b.order || 0),
});

/* ── Separate icon upload ── */
const iconUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/sports/',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `icon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok  = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    cb(null, ok);
  },
});

/* ── Wrapper router ── */
const router = express.Router();

/* POST /api/sports/upload-icon — must be before the CRUD wildcard */
router.post('/upload-icon', verifyToken, iconUpload.single('icon'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен или неверный формат' });
  res.json({ url: `/uploads/sports/${req.file.filename}` });
});

/* ── Sport photo gallery upload ── */
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/sports/',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext));
  },
});

router.post('/:id/add-photo', verifyToken, photoUpload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const sports = readSports();
  const idx = sports.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const url = `/uploads/sports/${req.file.filename}`;
  if (!Array.isArray(sports[idx].photos)) sports[idx].photos = [];
  sports[idx].photos.push(url);
  writeSports(sports);
  res.json({ url, photos: sports[idx].photos });
});

router.delete('/:id/remove-photo', verifyToken, (req, res) => {
  const sports = readSports();
  const idx = sports.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: 'Не указан url' });
  sports[idx].photos = (sports[idx].photos || []).filter(p => p !== url);
  writeSports(sports);
  res.json({ photos: sports[idx].photos });
});

/* Delegate everything else to the CRUD factory */
router.use('/', crudRouter);

module.exports = router;

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const createCRUD  = require('./crud');
const { verifyToken } = require('./auth');

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

/* Delegate everything else to the CRUD factory */
router.use('/', crudRouter);

module.exports = router;

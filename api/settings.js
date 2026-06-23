const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('./auth');

const FILE = 'data/settings.json';
function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return {}; }
}
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(read());
});

router.put('/', verifyToken, (req, res) => {
  const str = (v, max) => v != null ? String(v).trim().slice(0, max) : undefined;
  const current = read();
  const updated = { ...current };

  const email            = str(req.body.email, 200);
  const phone            = str(req.body.phone, 50);
  const socialVk         = str(req.body.socialVk, 200);
  const socialTelegram   = str(req.body.socialTelegram, 200);
  const socialInstagram  = str(req.body.socialInstagram, 200);
  const socialYoutube    = str(req.body.socialYoutube, 200);

  if (email !== undefined) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Некорректный email' });
    updated.email = email;
  }
  if (phone !== undefined)           updated.phone = phone;
  if (socialVk !== undefined)        updated.socialVk = socialVk;
  if (socialTelegram !== undefined)  updated.socialTelegram = socialTelegram;
  if (socialInstagram !== undefined) updated.socialInstagram = socialInstagram;
  if (socialYoutube !== undefined)   updated.socialYoutube = socialYoutube;
  if (req.body.siteTitleRu) updated.siteTitle = { ru: str(req.body.siteTitleRu, 200), ky: str(req.body.siteTitleKy, 200) || current.siteTitle?.ky };
  if (req.body.addressRu)   updated.address   = { ru: str(req.body.addressRu, 300), ky: str(req.body.addressKy, 300) || current.address?.ky };

  const cd = [
    ['countdownTitleRu', 300], ['countdownTitleKy', 300],
    ['countdownDate', 30], ['countdownTime', 10],
    ['countdownLocationRu', 300], ['countdownLocationKy', 300],
    ['countdownDescRu', 1000], ['countdownDescKy', 1000],
    ['countdownEventId', 100],
  ];
  cd.forEach(([k, max]) => {
    const v = str(req.body[k], max);
    if (v !== undefined) updated[k] = v;
  });

  const stats = [
    'stat1Value','stat1LabelRu','stat1LabelKy',
    'stat2Value','stat2LabelRu','stat2LabelKy',
    'stat3Value','stat3LabelRu','stat3LabelKy',
    'stat4Value','stat4LabelRu','stat4LabelKy',
  ];
  stats.forEach(k => {
    const v = str(req.body[k], 200);
    if (v !== undefined) updated[k] = v;
  });

  write(updated);
  res.json(updated);
});

/* ── Logo upload ── */
const logoStorage = multer.diskStorage({
  destination: './',
  filename: (req, file, cb) => cb(null, 'logo.png'),
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = /^image\//.test(file.mimetype) && ['.png','.jpg','.jpeg','.webp'].includes(ext);
    cb(null, ok);
  },
});

router.post('/logo', verifyToken, logoUpload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен или неверный формат' });
  res.json({ success: true, path: '/logo.png' });
});

module.exports = router;

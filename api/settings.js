const express = require('express');
const router = express.Router();
const fs = require('fs');
const { verifyToken } = require('./auth');

const FILE = 'data/settings.json';
function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return {}; }
}
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => res.json(read()));

router.put('/', verifyToken, (req, res) => {
  const str = (v, max) => v != null ? String(v).trim().slice(0, max) : undefined;
  const current = read();
  const updated = { ...current };

  const email = str(req.body.email, 200);
  const phone = str(req.body.phone, 50);
  const socialVk = str(req.body.socialVk, 200);
  const socialTelegram = str(req.body.socialTelegram, 200);
  const socialInstagram = str(req.body.socialInstagram, 200);
  if (email !== undefined) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Некорректный email' });
    updated.email = email;
  }
  if (phone !== undefined) updated.phone = phone;
  if (socialVk !== undefined) updated.socialVk = socialVk;
  if (socialTelegram !== undefined) updated.socialTelegram = socialTelegram;
  if (socialInstagram !== undefined) updated.socialInstagram = socialInstagram;
  if (req.body.siteTitleRu) updated.siteTitle = { ru: str(req.body.siteTitleRu, 200), ky: str(req.body.siteTitleKy, 200) || current.siteTitle?.ky };
  if (req.body.addressRu) updated.address = { ru: str(req.body.addressRu, 300), ky: str(req.body.addressKy, 300) || current.address?.ky };
  write(updated);
  res.json(updated);
});

module.exports = router;

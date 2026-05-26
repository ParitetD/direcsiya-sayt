const express = require('express');
const router = express.Router();
const fs = require('fs');
const { verifyToken } = require('./auth');

const FILE = 'data/settings.json';
function read() { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
function write(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

router.get('/', (req, res) => res.json(read()));

router.put('/', verifyToken, (req, res) => {
  const current = read();
  const updated = {
    ...current,
    email: req.body.email ?? current.email,
    phone: req.body.phone ?? current.phone,
    socialVk: req.body.socialVk ?? current.socialVk,
    socialTelegram: req.body.socialTelegram ?? current.socialTelegram,
    socialInstagram: req.body.socialInstagram ?? current.socialInstagram
  };
  if (req.body.siteTitleRu) updated.siteTitle = { ru: req.body.siteTitleRu, ky: req.body.siteTitleKy || current.siteTitle?.ky };
  if (req.body.addressRu) updated.address = { ru: req.body.addressRu, ky: req.body.addressKy || current.address?.ky };
  write(updated);
  res.json(updated);
});

module.exports = router;

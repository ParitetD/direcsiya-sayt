const express = require('express');
const router = express.Router();
const fs = require('fs');
const { verifyToken } = require('./auth');
const createCRUD = require('./crud');

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
  writeHistory(updated);
  res.json(updated);
});

router.use('/values', createCRUD({
  file: 'data/about-values.json',
  defaultSort: (a, b) => Number(a.order || 0) - Number(b.order || 0),
  bodyFields: ['titleRu','titleKy','textRu','textKy','order'],
  searchFields: ['titleRu','titleKy'],
}));

router.use('/timeline', createCRUD({
  file: 'data/about-timeline.json',
  defaultSort: (a, b) => Number(a.year || 0) - Number(b.year || 0),
  bodyFields: ['year','titleRu','titleKy','descRu','descKy','order'],
  searchFields: ['titleRu','titleKy','year'],
}));

module.exports = router;

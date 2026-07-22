/**
 * Stats API — простой учёт посещений сайта.
 *
 * Безопасность:
 * - Не хранит IP-адреса, cookies или персональные данные
 * - Запись (POST /track) доступна без авторизации, но защищена rate limiting
 * - Чтение (GET /) требует JWT-авторизации
 * - Whitelist-подход: только известные поля сохраняются
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { verifyToken } = require('./auth');

const STATS_FILE = 'data/stats.json';

function readStats() {
  try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); }
  catch { return { totalVisits: 0, dailyVisits: {}, pageVisits: {}, lastUpdated: new Date().toISOString() }; }
}

function writeStats(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Stats] Write error:', e.message);
  }
}

/* Whitelist of page paths — prevents injection of arbitrary keys */
const VALID_PAGES = new Set([
  '/', '/index.html', '/sports', '/sports.html',
  '/events', '/events.html', '/gallery', '/gallery.html',
  '/news', '/news.html', '/athletes', '/athletes.html',
  '/about', '/about.html', '/contacts', '/contacts.html',
]);

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/* POST /api/stats/track — record a page visit (no auth required) */
router.post('/track', (req, res) => {
  const rawPage = String(req.body.page || '/').split('?')[0];
  const page = VALID_PAGES.has(rawPage) ? rawPage : '/';

  const stats = readStats();
  stats.totalVisits = (stats.totalVisits || 0) + 1;

  const day = todayKey();
  stats.dailyVisits = stats.dailyVisits || {};
  stats.dailyVisits[day] = (stats.dailyVisits[day] || 0) + 1;

  // Prune daily visits older than 30 days to keep file small
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  for (const d of Object.keys(stats.dailyVisits)) {
    if (d < cutoffStr) delete stats.dailyVisits[d];
  }

  stats.pageVisits = stats.pageVisits || {};
  stats.pageVisits[page] = (stats.pageVisits[page] || 0) + 1;

  writeStats(stats);
  res.json({ ok: true });
});

/* GET /api/stats — full stats (auth required) */
router.get('/', verifyToken, (req, res) => {
  res.set('Cache-Control', 'no-store');
  const stats = readStats();

  // Build last-7-days array for chart
  const days = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(stats.dailyVisits?.[key] || 0);
    labels.push(d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));
  }

  // Top pages
  const topPages = Object.entries(stats.pageVisits || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, count]) => ({ page, count }));

  res.json({
    totalVisits: stats.totalVisits || 0,
    todayVisits: stats.dailyVisits?.[todayKey()] || 0,
    weekVisits: days.reduce((a, b) => a + b, 0),
    chartDays: days,
    chartLabels: labels,
    topPages,
    lastUpdated: stats.lastUpdated,
  });
});

module.exports = router;

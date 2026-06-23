require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Security middleware ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],
      scriptSrcAttr:  ["'unsafe-inline'"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://loremflickr.com"],
      connectSrc:     ["'self'"],
      frameSrc:       ["https://www.openstreetmap.org"],
      objectSrc:      ["'none'"],
      baseUri:        ["'self'"],
      formAction:     ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
// CORS: only open if CORS_ORIGIN is explicitly set; by default same-origin only.
if (process.env.CORS_ORIGIN) {
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/* ── Block direct access to source code and data files ── */
// express.static(root) would serve server.js, api/*.js, data/*.json to any HTTP client.
// Block these BEFORE static middleware. API routes (/api/news etc.) are NOT blocked here —
// only file-extension requests into the /api/ directory are blocked.
app.use((req, res, next) => {
  const p = path.posix.normalize(decodeURIComponent(req.path)).toLowerCase();
  const blocked = (
    p.startsWith('/data/') ||                                   // data/*.json
    (p.startsWith('/api/') && /\.[a-z]+$/.test(p)) ||          // api/*.js source files (not /api/news routes)
    p.startsWith('/scripts/') ||
    p.startsWith('/node_modules/') ||
    p === '/server.js' ||
    p === '/package.json' ||
    p === '/package-lock.json' ||
    p === '/ecosystem.config.js' ||
    p.endsWith('.env')
  );
  if (blocked) return res.status(403).json({ error: 'Forbidden' });
  next();
});

/* ── Page routes ── */
app.get('/athletes', (req, res) => res.sendFile(path.join(__dirname, 'athletes.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));

/* ── Static files (before admin SPA fallback) ── */
// JS/CSS: no-cache so code changes are always picked up immediately
// Library files (CropperJS etc): 30-day cache — these never change
// Uploads: 1-day cache — images rarely change
app.use('/css',     express.static(path.join(__dirname, 'css'),     { maxAge: 0 }));
app.use('/js',      express.static(path.join(__dirname, 'js'),      { maxAge: 0 }));
app.use('/admin/css', express.static(path.join(__dirname, 'admin', 'css'), { maxAge: 0 }));
app.use('/admin/js',  express.static(path.join(__dirname, 'admin', 'js'),  { maxAge: 0 }));
app.use('/admin/lib', express.static(path.join(__dirname, 'admin', 'lib'), { maxAge: '30d' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));
// Remaining static (HTML pages, logo, robots.txt etc.) — no long-term cache
app.use(express.static(path.join(__dirname), { extensions: ['html'], maxAge: 0 }));

/* ── Admin SPA fallback: only for non-file paths (no extension) ── */
app.get('/admin/*', (req, res) => {
  // If the path has a file extension (css, js, png, etc), it's a missing static file — 404
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

/* ── Rate limiting ── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много сообщений. Попробуйте через час.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/contact', contactLimiter);
app.use('/api/', apiLimiter);

/* ── Data directories & defaults ── */
const dirs = ['data', 'uploads/news', 'uploads/events', 'uploads/gallery', 'uploads/people', 'uploads/sports', 'uploads/slides'];
dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const dataDefaults = {
  'data/news.json': [],
  'data/events.json': [],
  'data/gallery.json': [],
  'data/people.json': [],
  'data/settings.json': {
    siteTitle: { ru: 'Дирекция спорта Кыргызстана', ky: 'Кыргызстандын спорт дирекциясы' },
    email: 'info@sport.kg',
    phone: '+996 312 000-000',
    address: { ru: 'г. Бишкек, пр. Манаса, д. 40', ky: 'Бишкек ш., Манас даңгыры, 40' },
    socialVk: '',
    socialTelegram: '',
    socialInstagram: ''
  }
};

Object.entries(dataDefaults).forEach(([file, def]) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(def, null, 2));
});

/* ── Init auth with env-based password ── */
async function initAuth() {
  const f = 'data/auth.json';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  if (!fs.existsSync(f)) {
    const hash = await bcrypt.hash(defaultPassword, 10);
    fs.writeFileSync(f, JSON.stringify({ username: 'admin', password: hash }, null, 2));
    console.log('⚠ Default admin created — change password after first login!');
  } else {
    const auth = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!auth.password.startsWith('$2a$')) {
      auth.password = await bcrypt.hash(auth.password, 10);
      fs.writeFileSync(f, JSON.stringify(auth, null, 2));
    }
  }
}

/* ── API routes ── */
app.use('/api/auth', require('./api/auth'));
app.use('/api/news', require('./api/news'));
app.use('/api/events', require('./api/events'));
app.use('/api/gallery', require('./api/gallery'));
app.use('/api/people', require('./api/people'));
app.use('/api/settings', require('./api/settings'));
app.use('/api/sports', require('./api/sports'));
app.use('/api/slides', require('./api/slides'));
app.use('/api/contact', require('./api/contact'));
app.use('/api/about', require('./api/about'));

/* ── Page routes moved before static middleware ── */

/* ── SEO static files ── */
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').sendFile(path.join(__dirname, 'sitemap.xml'));
});

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

/* ── Start ── */
initAuth().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Admin:  http://localhost:${PORT}/admin`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Порт ${PORT} уже занят!`);
      console.error('Решение: закройте другой процесс или выполните:');
      console.error('  taskkill /F /IM node.exe');
      console.error('  npm start\n');
      process.exit(1);
    } else {
      console.error('[Server Error]', err.message);
      process.exit(1);
    }
  });
}).catch(console.error);

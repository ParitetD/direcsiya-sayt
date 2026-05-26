const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

async function initAuth() {
  const f = 'data/auth.json';
  if (!fs.existsSync(f)) {
    const hash = await bcrypt.hash('admin123', 10);
    fs.writeFileSync(f, JSON.stringify({ username: 'admin', password: hash }, null, 2));
    console.log('Default admin created: admin / admin123');
  } else {
    const auth = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!auth.password.startsWith('$2a$')) {
      auth.password = await bcrypt.hash(auth.password, 10);
      fs.writeFileSync(f, JSON.stringify(auth, null, 2));
    }
  }
}

app.use('/api/auth', require('./api/auth'));
app.use('/api/news', require('./api/news'));
app.use('/api/events', require('./api/events'));
app.use('/api/gallery', require('./api/gallery'));
app.use('/api/people', require('./api/people'));
app.use('/api/settings', require('./api/settings'));
app.use('/api/sports', require('./api/sports'));
app.use('/api/slides', require('./api/slides'));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));

initAuth().then(() => {
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Admin:  http://localhost:${PORT}/admin`);
  });
}).catch(console.error);

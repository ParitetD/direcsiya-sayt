const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error('❌ JWT_SECRET is not set in .env — server cannot start securely');
  process.exit(1);
}
const AUTH_FILE = 'data/auth.json';

function readAuth() {
  try { return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')); }
  catch { throw new Error('Ошибка чтения данных авторизации'); }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });
  const auth = readAuth();
  // Always run bcrypt.compare to prevent timing-based username enumeration.
  // If username is wrong, compare against a dummy hash so timing is identical.
  const usernameMatch = auth.username === username;
  const hashToCompare = usernameMatch
    ? auth.password
    : '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
  const ok = await bcrypt.compare(password, hashToCompare);
  if (!usernameMatch || !ok) return res.status(401).json({ error: 'Неверные учётные данные' });
  const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '8h' });
  res.json({ token, username });
});

router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Минимум 6 символов' });
  const auth = readAuth();
  const ok = await bcrypt.compare(currentPassword, auth.password);
  if (!ok) return res.status(401).json({ error: 'Неверный текущий пароль' });
  auth.password = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
  res.json({ success: true });
});

function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Не авторизован' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Токен недействителен' });
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.verifyToken = verifyToken;

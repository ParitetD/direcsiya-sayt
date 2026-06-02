/**
 * Утилита для смены пароля администратора.
 * Запуск: node scripts/set-password.js
 * Или с аргументом: node scripts/set-password.js НовыйПароль
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const AUTH_FILE = path.join(__dirname, '..', 'data', 'auth.json');

function savePassword(password) {
  if (!password || password.length < 8) {
    console.error('Ошибка: пароль должен быть не менее 8 символов');
    process.exit(1);
  }
  const hash = bcrypt.hashSync(password, 12);
  const auth = fs.existsSync(AUTH_FILE)
    ? JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))
    : { username: 'admin' };
  auth.password = hash;
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
  console.log('✅ Пароль успешно изменён для пользователя:', auth.username);
  console.log('   Используйте новый пароль при входе в /admin');
}

const argPassword = process.argv[2];

if (argPassword) {
  savePassword(argPassword);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Новый пароль (мин. 8 символов): ', pwd => {
    rl.close();
    savePassword(pwd.trim());
  });
}

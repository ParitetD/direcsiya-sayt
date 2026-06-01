# Инструкция по деплою aurora-sports

## Требования к серверу
- Ubuntu 20.04 / 22.04
- Node.js 18+
- Nginx
- PM2
- Certbot (для SSL)

---

## Шаг 1 — Установка Node.js и PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

---

## Шаг 2 — Загрузка проекта

```bash
cd /var/www
sudo git clone <ваш-репозиторий> aurora
sudo chown -R $USER:$USER /var/www/aurora
cd /var/www/aurora
npm install --production
```

---

## Шаг 3 — Переменные окружения

```bash
cp .env.example .env
nano .env
```

Заполнить:
```env
JWT_SECRET=сгенерируйте-длинный-случайный-ключ
ADMIN_DEFAULT_PASSWORD=ваш-безопасный-пароль
CORS_ORIGIN=https://ваш-домен.kg
PORT=3000
```

Генерация JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Шаг 4 — Первый запуск и смена пароля

```bash
# Установить пароль администратора
node scripts/set-password.js

# Создать папку для логов
mkdir -p logs

# Запустить через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # скопировать и выполнить команду которую выведет PM2
```

---

## Шаг 5 — Nginx

```bash
# Заменить 'ваш-домен.kg' на реальный домен
sudo cp nginx.conf /etc/nginx/sites-available/aurora
sudo sed -i 's/ваш-домен.kg/realdomain.kg/g' /etc/nginx/sites-available/aurora
sudo ln -s /etc/nginx/sites-available/aurora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Шаг 6 — SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d realdomain.kg -d www.realdomain.kg
```

---

## Шаг 7 — Проверка

```bash
pm2 status           # aurora-sports должен быть online
pm2 logs aurora-sports --lines 20
curl https://realdomain.kg/api/news
```

---

## Резервные копии (cron)

```bash
crontab -e
# Добавить строку:
0 2 * * * tar -czf ~/backups/aurora-data-$(date +\%Y\%m\%d).tar.gz /var/www/aurora/data/ /var/www/aurora/uploads/ 2>/dev/null
```

---

## Обновление сайта

```bash
cd /var/www/aurora
git pull
npm install --production
pm2 restart aurora-sports
```

---

## Полезные команды

```bash
pm2 status                    # состояние процесса
pm2 logs aurora-sports        # логи в реальном времени
pm2 restart aurora-sports     # перезапуск
pm2 monit                     # мониторинг CPU/RAM

sudo nginx -t                 # проверка конфига Nginx
sudo systemctl reload nginx   # применить изменения Nginx
sudo certbot renew --dry-run  # тест обновления SSL
```

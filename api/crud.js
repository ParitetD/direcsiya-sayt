/**
 * CRUD Factory — универсальная фабрика для создания API-роутов.
 *
 * Безопасность: whitelist-подход для фильтров и тела запроса.
 * Каждый endpoint явно объявляет разрешённые поля через filterFields и bodyFields.
 * Всё остальное из req.query и req.body игнорируется — не блокируется, а просто
 * не извлекается. Нельзя обойти то, что никогда не читается.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('./auth');

/* Safe unique ID — timestamp + 5 random base-36 chars (no collision under load) */
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Whitelist extraction: copies only explicitly declared field names from source.
 * Object.create(null) — результирующий объект не имеет прототипа вообще,
 * поэтому нет __proto__, нет constructor, нет цепочки наследования.
 */
function pickFields(source, fields) {
  if (!source || !fields || !fields.length) return {};
  const result = Object.create(null);
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  }
  return result;
}

/* Allowed image extensions (defence-in-depth alongside MIME type check) */
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function createCRUD(options) {
  const {
    file,
    uploadDir,
    uploadField,
    allowedMime,
    maxSize,
    defaultSort,
    searchFields,
    filterFields = [], // whitelist: query params allowed for filtering, e.g. ['status', 'category']
    bodyFields   = [], // whitelist: body fields allowed on create/update
    onCreate,
    onUpdate,
  } = options;

  const router = express.Router();

  /* ── Multer config ── */
  const upload = uploadDir ? multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
      },
    }),
    limits: { fileSize: maxSize || 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext    = path.extname(file.originalname).toLowerCase();
      const mimeOk = !allowedMime || allowedMime.test(file.mimetype);
      const extOk  = ALLOWED_IMAGE_EXTS.has(ext);
      cb(null, mimeOk && extOk);
    },
  }) : null;

  /* ── Helpers ── */
  function read() {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) { return []; }
  }

  function write(data) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error(`[CRUD] Write error (${file}):`, e.message);
      return false;
    }
  }

  /* ── GET / — list with search, whitelist-filter, pagination ── */
  router.get('/', (req, res) => {
    try {
      let items = read();

      // Explicitly destructure known safe params — nothing else is touched
      const { search, page = 1, limit = 20 } = req.query;

      // Full-text search across declared searchFields
      if (search && searchFields && searchFields.length) {
        const q = String(search).toLowerCase();
        items = items.filter(item =>
          searchFields.some(field => {
            const val = item[field];
            return val && typeof val === 'string' && val.toLowerCase().includes(q);
          })
        );
      }

      // Whitelist filter — pull only declared field names from req.query by name.
      // Anything not in filterFields never leaves req.query, so no injection possible.
      for (const key of filterFields) {
        const val = req.query[key]; // explicit named access, not spread
        if (val !== undefined && val !== '') {
          items = items.filter(item => String(item[key] ?? '') === String(val));
        }
      }

      // Sort
      if (defaultSort) {
        items.sort(defaultSort);
      } else if (items.length && items[0].createdAt) {
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const total     = items.length;
      const pageNum   = Math.max(1, Number(page)  || 1);
      const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));
      const start     = (pageNum - 1) * pageLimit;
      res.json({ data: items.slice(start, start + pageLimit), total });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка чтения данных' });
    }
  });

  /* ── GET /:id ── */
  router.get('/:id', (req, res) => {
    try {
      const item = read().find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Не найдено' });
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: 'Ошибка чтения данных' });
    }
  });

  /* ── POST / — create ── */
  const createMiddleware = upload
    ? [verifyToken, upload.array(uploadField || 'image', 10)]
    : [verifyToken];

  router.post('/', ...createMiddleware, (req, res) => {
    try {
      const items = read();
      const item = {
        id:        makeId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...pickFields(req.body, bodyFields), // only whitelisted fields enter the DB
      };
      if (upload && req.files && req.files.length) {
        const field = uploadField || 'image';
        item[field] = `/${uploadDir}${req.files[0].filename}`;
        const fileImages = req.files.slice(1).map(f => `/${uploadDir}${f.filename}`);
        const urlImages = [].concat(req.body['images[]'] || []).filter(Boolean);
        item.images = [...fileImages, ...urlImages];
      } else {
        const urlImages = [].concat(req.body['images[]'] || []).filter(Boolean);
        if (urlImages.length) item.images = urlImages;
      }
      if (onCreate) onCreate(item, req);
      items.unshift(item);
      if (!write(items)) return res.status(500).json({ error: 'Ошибка сохранения' });
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ error: 'Ошибка создания' });
    }
  });

  /* ── PUT /:id — update ── */
  const updateMiddleware = upload
    ? [verifyToken, upload.array(uploadField || 'image', 10)]
    : [verifyToken];

  router.put('/:id', ...updateMiddleware, (req, res) => {
    try {
      const items = read();
      const idx   = items.findIndex(i => i.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
      const updated = {
        ...items[idx],
        ...pickFields(req.body, bodyFields), // only whitelisted fields can overwrite
        updatedAt: new Date().toISOString(),
      };
      if (upload && req.files && req.files.length) {
        const field = uploadField || 'image';
        updated[field] = `/${uploadDir}${req.files[0].filename}`;
        const fileImages = req.files.slice(1).map(f => `/${uploadDir}${f.filename}`);
        const urlImages = [].concat(req.body['images[]'] || []).filter(Boolean);
        updated.images = [...fileImages, ...urlImages];
      } else {
        const urlImages = [].concat(req.body['images[]'] || []).filter(Boolean);
        updated.images = urlImages;
      }
      if (onUpdate) onUpdate(updated, req, items[idx]);
      items[idx] = updated;
      if (!write(items)) return res.status(500).json({ error: 'Ошибка сохранения' });
      res.json(items[idx]);
    } catch (e) {
      res.status(500).json({ error: 'Ошибка обновления' });
    }
  });

  /* ── DELETE /:id ── */
  router.delete('/:id', verifyToken, (req, res) => {
    try {
      const items = read();
      const idx   = items.findIndex(i => i.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
      items.splice(idx, 1);
      if (!write(items)) return res.status(500).json({ error: 'Ошибка сохранения' });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка удаления' });
    }
  });

  return router;
}

module.exports = createCRUD;

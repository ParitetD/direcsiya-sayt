const createCRUD = require('./crud');

const SOCIAL_FIELDS = ['socialInstagram', 'socialTelegram', 'socialYoutube', 'socialFacebook'];

function safeUrl(v) {
  if (!v) return '';
  try { const u = new URL(v); return (u.protocol === 'http:' || u.protocol === 'https:') ? v : ''; }
  catch { return ''; }
}

function sanitizeSocials(item) {
  SOCIAL_FIELDS.forEach(f => { if (f in item) item[f] = safeUrl(item[f]); });
  if (!item.status) item.status = 'published';
}

module.exports = createCRUD({
  file:         'data/people.json',
  uploadDir:    'uploads/people/',
  uploadField:  'photo',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['nameRu', 'nameKy'],
  filterFields: ['role', 'careerStatus', 'status'],
  bodyFields:   [
    'nameRu', 'nameKy', 'nameEn',
    'role', 'careerStatus', 'status',
    'titleRu', 'titleKy', 'titleEn',
    'sportRu', 'sportKy', 'sportEn',
    'bioRu', 'bioKy', 'bioEn',
    'achievementsRu', 'achievementsKy', 'achievementsEn',
    'photo', 'order',
    'socialInstagram', 'socialTelegram', 'socialYoutube', 'socialFacebook',
  ],
  defaultSort: (a, b) => (a.order || 0) - (b.order || 0),
  onCreate: sanitizeSocials,
  onUpdate: sanitizeSocials,
});

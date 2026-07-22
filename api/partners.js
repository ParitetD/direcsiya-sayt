const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/partners.json',
  uploadDir:    'uploads/partners/',
  uploadField:  'logo',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/,
  maxSize:      2 * 1024 * 1024,
  searchFields: ['nameRu', 'nameKy', 'nameEn'],
  bodyFields:   ['nameRu', 'nameKy', 'nameEn', 'url', 'logo', 'order', 'status'],
  defaultSort:  (a, b) => (a.order || 0) - (b.order || 0),
});

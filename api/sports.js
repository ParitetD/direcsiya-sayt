const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/sports.json',
  uploadDir:    'uploads/sports/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['nameRu', 'nameKy'],
  filterFields: ['status'],
  bodyFields:   [
    'nameRu', 'nameKy',
    'descriptionRu', 'descriptionKy',
    'athletesCount', 'order', 'status',
    'image',
  ],
  defaultSort: (a, b) => (a.order || 0) - (b.order || 0),
});

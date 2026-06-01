const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/events.json',
  uploadDir:    'uploads/events/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['titleRu', 'titleKy'],
  filterFields: ['status', 'category'],
  bodyFields:   [
    'titleRu', 'titleKy',
    'descriptionRu', 'descriptionKy',
    'date', 'location',
    'category', 'status',
    'image',
  ],
  defaultSort: (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
});

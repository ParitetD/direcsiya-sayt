const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/gallery.json',
  uploadDir:    'uploads/gallery/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      8 * 1024 * 1024,
  searchFields: ['titleRu', 'titleKy'],
  filterFields: ['category'],
  bodyFields:   ['titleRu', 'titleKy', 'category', 'image'],
});

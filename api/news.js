const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/news.json',
  uploadDir:    'uploads/news/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['titleRu', 'titleKy'],
  filterFields: ['status', 'category'],
  bodyFields:   [
    'titleRu', 'titleKy',
    'contentRu', 'contentKy',
    'category', 'status',
    'image',
    'videoUrl',
    'videoPlatform',
  ],
});

const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/livestreams.json',
  uploadDir:    'uploads/livestreams/',
  uploadField:  'thumbnail',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['titleRu', 'titleKy'],
  filterFields: ['status', 'platform'],
  bodyFields:   [
    'titleRu', 'titleKy', 'titleEn',
    'descriptionRu', 'descriptionKy', 'descriptionEn',
    'streamUrl', 'platform',
    'status', 'scheduledAt',
    'thumbnail',
  ],
});

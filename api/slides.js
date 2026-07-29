const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/slides.json',
  uploadDir:    'uploads/slides/',
  uploadField:  'image',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['titleRu', 'titleKy'],
  filterFields: ['active'],
  bodyFields:   [
    'titleRu', 'titleKy', 'titleEn',
    'subtitleRu', 'subtitleKy', 'subtitleEn',
    'order', 'active',
    'image',
  ],
  defaultSort: (a, b) => (a.order || 0) - (b.order || 0),
  onCreate:    (item) => { item.active = item.active === true || item.active === 'true' || item.active === '1' || item.active === 'on'; },
  onUpdate:    (item) => { item.active = item.active === true || item.active === 'true' || item.active === '1' || item.active === 'on'; },
});

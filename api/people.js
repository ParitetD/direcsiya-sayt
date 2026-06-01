const createCRUD = require('./crud');

module.exports = createCRUD({
  file:         'data/people.json',
  uploadDir:    'uploads/people/',
  uploadField:  'photo',
  allowedMime:  /^image\/(jpeg|jpg|png|gif|webp)$/,
  maxSize:      5 * 1024 * 1024,
  searchFields: ['nameRu', 'nameKy'],
  filterFields: ['role', 'careerStatus', 'status'],
  bodyFields:   [
    'nameRu', 'nameKy',
    'role', 'careerStatus', 'status',
    'titleRu', 'titleKy',
    'sportRu', 'sportKy',
    'bioRu', 'bioKy',
    'achievementsRu', 'achievementsKy',
    'photo', 'order',
  ],
  defaultSort: (a, b) => (a.order || 0) - (b.order || 0),
});

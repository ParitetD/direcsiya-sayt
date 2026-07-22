/* ── State ── */
let token = localStorage.getItem('adminToken');
let currentUser = null;
let currentPage = {};
let currentFilter = {};
let currentSearch = {};
let drawerSection = null;
let drawerItemId = null;
let searchTimers = {};
let cropperInstance = null;
let cropCallback = null;
let currentCropRatio = 16/9;
const croppedBlobs = {};

/* ── Section config ── */
const CFG = {
  news: {
    title: 'Новости', hint: 'Управление новостями и анонсами', api: '/api/news',
    cols: [
      {key:'image',label:'Фото',type:'img'},
      {key:'titleRu',label:'Заголовок',type:'name'},
      {key:'category',label:'Тип',map:{news:'Новость',announcement:'Анонс',result:'Результат'}},
      {key:'status',label:'Статус',type:'badge'},
      {key:'createdAt',label:'Дата',type:'date'}
    ],
    filterKey:'status', filterOpts:[{v:'',l:'Все статусы'},{v:'published',l:'Опубликовано'},{v:'draft',l:'Черновик'},{v:'archived',l:'Архив'}],
    fields:[
      {key:'titleRu',label:'Заголовок',lang:'ru',type:'text',req:true,ph:'Заголовок новости на русском'},
      {key:'titleKy',label:'Аталышы',lang:'ky',type:'text',req:true,ph:'Кыргызча аталышы'},
      {key:'contentRu',label:'Текст новости',lang:'ru',type:'editor',ph:'Введите текст новости...'},
      {key:'contentKy',label:'Тексти',lang:'ky',type:'editor',ph:'Жаңылыктын тексти...'},
      {key:'category',label:'Категория',type:'select',noLang:true,opts:[{v:'news',l:'Новость'},{v:'announcement',l:'Анонс'},{v:'result',l:'Результат'}]},
      {key:'image',label:'Обложка',type:'upload'},
      {key:'videoUrl',label:'Ссылка на видео',type:'text',noLang:true,ph:'https://youtube.com/watch?v=... или https://vimeo.com/...'},
      {key:'videoPlatform',label:'Платформа видео',type:'select',noLang:true,opts:[{v:'',l:'Не выбрано'},{v:'youtube',l:'YouTube'},{v:'vimeo',l:'Vimeo'}]}
    ]
  },
  events: {
    title:'Мероприятия', hint:'Соревнования, чемпионаты и события', api:'/api/events',
    cols:[
      {key:'image',label:'Фото',type:'img'},
      {key:'titleRu',label:'Название',type:'name'},
      {key:'date',label:'Дата',type:'date'},
      {key:'location',label:'Место'},
      {key:'status',label:'Статус',type:'badge'}
    ],
    filterKey:'status', filterOpts:[{v:'',l:'Все статусы'},{v:'published',l:'Опубликовано'},{v:'draft',l:'Черновик'}],
    fields:[
      {key:'titleRu',label:'Название',lang:'ru',type:'text',req:true,ph:'Название мероприятия'},
      {key:'titleKy',label:'Аталышы',lang:'ky',type:'text',req:true,ph:'Иш-чаранын аталышы'},
      {key:'descriptionRu',label:'Описание',lang:'ru',type:'textarea',ph:'Подробное описание...'},
      {key:'descriptionKy',label:'Сүрөттөмө',lang:'ky',type:'textarea',ph:'Кеңири маалымат...'},
      {key:'date',label:'Дата проведения',type:'date',noLang:true},
      {key:'location',label:'Место проведения',type:'text',noLang:true,ph:'Город, адрес'},
      {key:'category',label:'Категория',type:'select',noLang:true,opts:[{v:'competition',l:'Соревнование'},{v:'championship',l:'Чемпионат'},{v:'seminar',l:'Семинар'},{v:'other',l:'Другое'}]},
      {key:'image',label:'Фото мероприятия',type:'upload'}
    ]
  },
  gallery: {
    title:'Галерея', hint:'Фотографии соревнований и событий', api:'/api/gallery', viewType:'grid',
    filterKey:'category', filterOpts:[{v:'',l:'Все'},{v:'wrestling',l:'Борьба'},{v:'archery',l:'Стрельба из лука'},{v:'horse',l:'Конные игры'},{v:'festival',l:'Праздники'},{v:'athletes',l:'Спортсмены'}],
    fields:[
      {key:'titleRu',label:'Подпись',lang:'ru',type:'text',ph:'Описание фотографии'},
      {key:'titleKy',label:'Сүрөт жазуусу',lang:'ky',type:'text',ph:'Сүрөт жазуусу'},
      {key:'category',label:'Категория',type:'select',noLang:true,opts:[{v:'wrestling',l:'Борьба'},{v:'archery',l:'Стрельба из лука'},{v:'horse',l:'Конные игры'},{v:'festival',l:'Праздники'},{v:'athletes',l:'Спортсмены'}]},
      {key:'image',label:'Фотография',type:'upload',req:true}
    ]
  },
  people: {
    title:'Спортсмены', hint:'Спортсмены, тренеры и сотрудники', api:'/api/people',
    cols:[
      {key:'photo',label:'Фото',type:'img'},
      {key:'nameRu',label:'Имя',type:'name'},
      {key:'role',label:'Роль',type:'badge',map:{athlete:'Спортсмен',staff:'Сотрудник',coach:'Тренер'}},
      {key:'sportRu',label:'Вид спорта'},
      {key:'careerStatus',label:'Статус',type:'badge',map:{active:'Активный',retired:'В отставке'}}
    ],
    filterKey:'role', filterOpts:[{v:'',l:'Все роли'},{v:'athlete',l:'Спортсмены'},{v:'coach',l:'Тренеры'},{v:'staff',l:'Сотрудники'}],
    fields:[
      {key:'nameRu',label:'Имя',lang:'ru',type:'text',req:true,ph:'ФИО на русском'},
      {key:'nameKy',label:'Аты-жөнү',lang:'ky',type:'text',req:true,ph:'Кыргызча аты-жөнү'},
      {key:'role',label:'Роль',type:'select',noLang:true,opts:[{v:'athlete',l:'Спортсмен'},{v:'coach',l:'Тренер'},{v:'staff',l:'Сотрудник'}]},
      {key:'careerStatus',label:'Карьерный статус',type:'select',noLang:true,opts:[{v:'active',l:'Действующий'},{v:'retired',l:'В отставке'}]},
      {key:'titleRu',label:'Должность',lang:'ru',type:'text',ph:'Должность или звание'},
      {key:'titleKy',label:'Кызматы',lang:'ky',type:'text',ph:'Кызматы же наамы'},
      {key:'sportRu',label:'Вид спорта',lang:'ru',type:'text',ph:'Дисциплина'},
      {key:'sportKy',label:'Спорт түрү',lang:'ky',type:'text',ph:'Спорт тармагы'},
      {key:'bioRu',label:'Биография',lang:'ru',type:'textarea',ph:'Краткая биография...'},
      {key:'bioKy',label:'Өмүр баяны',lang:'ky',type:'textarea',ph:'Кыскача өмүр баяны...'},
      {key:'achievementsRu',label:'Достижения',lang:'ru',type:'textarea',ph:'Медали, титулы — по одному на строку'},
      {key:'achievementsKy',label:'Жетишкендиктер',lang:'ky',type:'textarea',ph:'Медалдар, наамдар — ар бири жаңы сапта'},
      {key:'photo',label:'Фотография',type:'upload'},
      {key:'socialInstagram',label:'Instagram',type:'text',noLang:true,ph:'https://instagram.com/...'},
      {key:'socialTelegram', label:'Telegram', type:'text',noLang:true,ph:'https://t.me/...'},
      {key:'socialYoutube',  label:'YouTube',  type:'text',noLang:true,ph:'https://youtube.com/@...'},
      {key:'socialFacebook', label:'Facebook', type:'text',noLang:true,ph:'https://facebook.com/...'}
    ]
  },
  slides: {
    title: 'Слайдер', hint: 'Управление слайдами на главной странице', api: '/api/slides',
    cols: [
      {key:'image', label:'Фото', type:'img'},
      {key:'titleRu', label:'Заголовок', type:'name'},
      {key:'order', label:'Порядок'},
      {key:'active', label:'Активен', type:'badge', map:{true:'Активен', false:'Скрыт'}}
    ],
    fields: [
      {key:'titleRu', label:'Заголовок', lang:'ru', type:'text', req:true, ph:'Заголовок слайда'},
      {key:'titleKy', label:'Аталышы', lang:'ky', type:'text', req:true, ph:'Слайддын аталышы'},
      {key:'subtitleRu', label:'Подзаголовок', lang:'ru', type:'textarea', ph:'Краткое описание'},
      {key:'subtitleKy', label:'Кыскача', lang:'ky', type:'textarea', ph:'Кыскача маалымат'},
      {key:'order',  label:'Порядок показа', type:'number', noLang:true},
      {key:'active', label:'Статус слайда', type:'select', noLang:true,
        opts:[{v:'true',l:'Активен — показывается на сайте'},{v:'false',l:'Скрыт — не показывается'}]},
      {key:'image',  label:'Фото слайда', type:'upload', req:true}
    ]
  },
  sports: {
    title: 'Виды спорта', hint: 'Управление видами спорта', api: '/api/sports',
    cols: [
      {key:'image', label:'Фото', type:'img'},
      {key:'nameRu', label:'Название', type:'name'},
      {key:'order', label:'Порядок'},
      {key:'athletesCount', label:'Спортсменов'},
      {key:'status', label:'Статус', type:'badge'}
    ],
    filterKey:'status', filterOpts:[{v:'',l:'Все'},{v:'published',l:'Опубликовано'},{v:'draft',l:'Черновик'}],
    fields:[
      {key:'nameRu', label:'Название', lang:'ru', type:'text', req:true, ph:'Вид спорта на русском'},
      {key:'nameKy', label:'Аталышы', lang:'ky', type:'text', req:true, ph:'Кыргызча аталышы'},
      {key:'descriptionRu', label:'Краткое описание', lang:'ru', type:'textarea', ph:'Краткое описание вида спорта...'},
      {key:'descriptionKy', label:'Кыска сүрөттөмө', lang:'ky', type:'textarea', ph:'Спорт түрүнүн кыска сүрөттөмөсү...'},
      {key:'fullDescRu', label:'Полное описание', lang:'ru', type:'textarea', ph:'Подробная история и правила вида спорта...'},
      {key:'fullDescKy', label:'Толук сүрөттөмө', lang:'ky', type:'textarea', ph:'Спорт түрүнүн тарыхы жана эрежелери...'},
      {key:'athletesCount', label:'Число спортсменов', type:'number', noLang:true},
      {key:'order', label:'Порядок показа (1 = первый)', type:'number', noLang:true},
      {key:'status', label:'Статус', type:'select', noLang:true, opts:[{v:'published',l:'Опубликован — виден на сайте'},{v:'draft',l:'Черновик — скрыт'}]},
      {key:'image', label:'Фотография', type:'upload'},
      {key:'icon',  label:'Иконка вида спорта', type:'icon-upload', noLang:true}
    ]
  },
  partners: {
    title: 'Партнёры', hint: 'Партнёры и организации на главной странице', api: '/api/partners',
    cols: [
      {key:'logo',   label:'Лого', type:'img'},
      {key:'nameRu', label:'Название', type:'name'},
      {key:'url',    label:'Ссылка'},
      {key:'order',  label:'Порядок'},
      {key:'status', label:'Статус', type:'badge'}
    ],
    filterKey:'status', filterOpts:[{v:'',l:'Все'},{v:'published',l:'Активно'},{v:'draft',l:'Скрыто'}],
    fields:[
      {key:'nameRu', label:'Название', lang:'ru', type:'text', req:true, ph:'Название партнёра'},
      {key:'nameKy', label:'Аталышы', lang:'ky', type:'text', ph:'Өнөктөштүн аталышы'},
      {key:'nameEn', label:'Name (EN)', type:'text', noLang:true, ph:'Partner name in English'},
      {key:'url',    label:'Ссылка на сайт', type:'text', noLang:true, ph:'https://...'},
      {key:'logo',   label:'Логотип', type:'upload'},
      {key:'order',  label:'Порядок показа (1 = первый)', type:'number', noLang:true},
      {key:'status', label:'Статус', type:'select', noLang:true, opts:[{v:'published',l:'Активен — виден на сайте'},{v:'draft',l:'Скрыт'}]}
    ]
  },
  'about-values': {
    title:'Ценность', api:'/api/about/values',
    cols:[{key:'titleRu',label:'Название',type:'name'},{key:'textRu',label:'Текст'}],
    fields:[
      {key:'titleRu',label:'Название (RU)',lang:'ru',type:'text',req:true,ph:'Название ценности'},
      {key:'titleKy',label:'Аталышы (KY)',lang:'ky',type:'text',ph:'Баалуулуктун аталышы'},
      {key:'textRu',label:'Текст (RU)',lang:'ru',type:'textarea',ph:'Описание ценности...'},
      {key:'textKy',label:'Тексти (KY)',lang:'ky',type:'textarea',ph:'Баалуулуктун сүрөттөмөсү...'},
      {key:'order',label:'Порядок (1 = первый)',type:'number',noLang:true}
    ]
  },
  'about-timeline': {
    title:'Ключевая дата', api:'/api/about/timeline',
    cols:[{key:'year',label:'Год'},{key:'titleRu',label:'Событие',type:'name'}],
    fields:[
      {key:'year',label:'Год',type:'text',noLang:true,req:true,ph:'2015'},
      {key:'titleRu',label:'Название (RU)',lang:'ru',type:'text',req:true,ph:'Название события'},
      {key:'titleKy',label:'Аталышы (KY)',lang:'ky',type:'text',ph:'Окуянын аталышы'},
      {key:'descRu',label:'Краткое описание (RU)',lang:'ru',type:'textarea',ph:'Краткое описание...'},
      {key:'descKy',label:'Кыска сүрөттөмө (KY)',lang:'ky',type:'textarea',ph:'Кыскача сүрөттөмө...'},
      {key:'fullDescRu',label:'Полное описание (RU)',lang:'ru',type:'textarea',ph:'Подробное описание события, фоновая информация...'},
      {key:'fullDescKy',label:'Толук сүрөттөмө (KY)',lang:'ky',type:'textarea',ph:'Окуянын толук сүрөттөмөсү...'},
      {key:'order',label:'Порядок (1 = первый)',type:'number',noLang:true}
    ]
  },
  livestreams: {
    title:'Прямые эфиры', hint:'Управление трансляциями YouTube/Vimeo', api:'/api/livestreams',
    cols:[
      {key:'thumbnail',label:'Обложка',type:'img'},
      {key:'titleRu',label:'Название',type:'name'},
      {key:'platform',label:'Платформа',map:{youtube:'YouTube',vimeo:'Vimeo'}},
      {key:'status',label:'Статус',type:'badge',map:{live:'В эфире',scheduled:'Запланирован',ended:'Завершён'}},
      {key:'scheduledAt',label:'Дата эфира',type:'date'}
    ],
    filterKey:'status', filterOpts:[{v:'',l:'Все статусы'},{v:'live',l:'В эфире'},{v:'scheduled',l:'Запланированные'},{v:'ended',l:'Завершённые'}],
    fields:[
      {key:'titleRu',label:'Название',lang:'ru',type:'text',req:true,ph:'Название трансляции'},
      {key:'titleKy',label:'Аталышы',lang:'ky',type:'text',req:true,ph:'Трансляциянын аталышы'},
      {key:'descriptionRu',label:'Описание',lang:'ru',type:'textarea',ph:'Описание трансляции...'},
      {key:'descriptionKy',label:'Сүрөттөмө',lang:'ky',type:'textarea',ph:'Трансляциянын сүрөттөмөсү...'},
      {key:'streamUrl',label:'Ссылка на трансляцию',type:'text',noLang:true,req:true,ph:'https://youtube.com/watch?v=... или https://vimeo.com/...'},
      {key:'platform',label:'Платформа',type:'select',noLang:true,opts:[{v:'youtube',l:'YouTube'},{v:'vimeo',l:'Vimeo'}]},
      {key:'status',label:'Статус',type:'select',noLang:true,opts:[{v:'live',l:'В эфире — транслируется сейчас'},{v:'scheduled',l:'Запланирован — анонс на сайте'},{v:'ended',l:'Завершён — архив'}]},
      {key:'scheduledAt',label:'Дата и время эфира',type:'datetime-local',noLang:true},
      {key:'thumbnail',label:'Обложка эфира',type:'upload'}
    ]
  }
};

/* ── Bootstrap ── */
window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', route);
  route();
});

async function route() {
  if (!token) token = localStorage.getItem('adminToken');
  if (!token) { showLogin(); return; }
  try {
    const r = await api('/api/auth/verify');
    currentUser = r.user;
    showApp();
    navigate(location.hash.slice(1) || 'dashboard');
  } catch {
    token = null; localStorage.removeItem('adminToken');
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  if (currentUser) {
    const u = currentUser.username;
    const init = u[0].toUpperCase();
    document.getElementById('sb-uname').textContent = u;
    document.getElementById('sb-avatar').textContent = init;
    document.getElementById('topbar-avatar').textContent = init;
  }
  loadBadges();
}

async function loadBadges() {
  for (const s of ['news','events','gallery','people','sports','slides','livestreams','partners']) {
    try {
      const r = await api(`${CFG[s].api}?limit=1`);
      const el = document.getElementById(`badge-${s}`);
      if (el && r.total) el.textContent = r.total;
    } catch {}
  }
  // Contacts: show count of unread messages
  try {
    const r = await api('/api/contact?limit=50');
    const unread = (r.data || []).filter(m => !m.read).length;
    const el = document.getElementById('badge-contacts');
    if (el) el.textContent = unread || '';
  } catch {}
}

/* ── Navigation ── */
function navigate(section) {
  document.querySelectorAll('.sb-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  const labels = {dashboard:'Дашборд',news:'Новости',events:'Мероприятия',gallery:'Галерея',people:'Спортсмены',sports:'Виды спорта',livestreams:'Прямые эфиры',slides:'Слайдер',partners:'Партнёры',settings:'Настройки',contacts:'Обращения',homepage:'Главная страница',help:'Инструкция',about:'О нас'};
  document.getElementById('topbar-section').textContent = labels[section] || section;
  if (section === 'dashboard') renderDashboard();
  else if (section === 'settings') renderSettings();
  else if (section === 'homepage') renderHomePage();
  else if (section === 'contacts') renderContacts();
  else if (section === 'help') renderHelp();
  else if (section === 'about') renderAbout();
  else if (CFG[section]) renderSection(section);
}

/* ── Auth ── */
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-error');
  err.classList.add('hidden');
  btn.disabled = true; btn.textContent = 'Выполняется вход...';
  try {
    const r = await api('/api/auth/login', 'POST', {
      username: document.getElementById('login-username').value,
      password: document.getElementById('login-password').value
    });
    token = r.token; localStorage.setItem('adminToken', token);
    currentUser = { username: r.username };
    showApp(); location.hash = 'dashboard'; navigate('dashboard');
  } catch (ex) {
    err.textContent = ex.message || 'Ошибка входа';
    err.classList.remove('hidden');
  } finally { btn.disabled = false; btn.textContent = 'Войти в систему'; }
}

function logout() {
  token = null; currentUser = null;
  localStorage.removeItem('adminToken');
  location.hash = ''; showLogin();
}

function togglePassword() {
  const i = document.getElementById('login-password');
  i.type = i.type === 'password' ? 'text' : 'password';
}

/* ── Dashboard ── */
async function renderDashboard() {
  const c = document.getElementById('content');
  c.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';
  const [news, events, gallery, people] = await Promise.all(
    ['news','events','gallery','people'].map(s => api(`${CFG[s].api}?limit=1`).catch(() => ({total:0,data:[]})))
  );
  const [recentNews, recentEvents] = await Promise.all([
    api('/api/news?limit=5').catch(() => ({data:[]})),
    api('/api/events?limit=5').catch(() => ({data:[]}))
  ]);
  const stats = await api('/api/stats').catch(() => null);

  const kpis = [
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,cls:'i-red',val:news.total||0,lbl:'Новостей'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,cls:'i-gold',val:events.total||0,lbl:'Мероприятий'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,cls:'i-green',val:gallery.total||0,lbl:'Фотографий'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,cls:'i-blue',val:people.total||0,lbl:'Людей'}
  ];

  // Stats widget
  const statsHtml = stats ? (function() {
    const maxVal = Math.max.apply(null, stats.chartDays.concat([1]));
    const bars = stats.chartDays.map(function(v, i) {
      const h = Math.max(4, Math.round((v / maxVal) * 100));
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">'
        + '<span style="font-size:.7rem;color:var(--t2);font-weight:600">' + (v || '') + '</span>'
        + '<div style="width:100%;max-width:32px;height:' + h + 'px;background:linear-gradient(180deg,var(--brand),var(--gold));border-radius:4px 4px 0 0;min-height:4px;transition:height .3s"></div>'
        + '<span style="font-size:.65rem;color:var(--t3)">' + escapeHtml(stats.chartLabels[i]) + '</span>'
      + '</div>';
    }).join('');
    const topPagesHtml = (stats.topPages || []).slice(0, 5).map(function(p) {
      const pageNames = {'/':'Главная','/index.html':'Главная','/news':'Новости','/news.html':'Новости','/events':'Мероприятия','/events.html':'Мероприятия','/gallery':'Галерея','/gallery.html':'Галерея','/sports':'Виды спорта','/sports.html':'Виды спорта','/athletes':'Спортсмены','/athletes.html':'Спортсмены','/about':'О нас','/about.html':'О нас','/contacts':'Контакты','/contacts.html':'Контакты'};
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:.8rem">'
        + '<span>' + escapeHtml(pageNames[p.page] || p.page) + '</span>'
        + '<span style="font-weight:700;color:var(--brand)">' + p.count + '</span>'
      + '</div>';
    }).join('');
    return '<div class="dash-card" style="grid-column:1/-1">'
      + '<div class="dash-card-head"><h3>📊 Статистика посещений</h3></div>'
      + '<div style="padding:20px">'
      + '<div style="display:flex;gap:24px;margin-bottom:20px;flex-wrap:wrap">'
        + '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:700;color:var(--brand)">' + (stats.totalVisits||0) + '</div><div style="font-size:.75rem;color:var(--t2)">Всего посещений</div></div>'
        + '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:700;color:var(--green)">' + (stats.todayVisits||0) + '</div><div style="font-size:.75rem;color:var(--t2)">Сегодня</div></div>'
        + '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:700;color:var(--gold-t,#C8963E)">' + (stats.weekVisits||0) + '</div><div style="font-size:.75rem;color:var(--t2)">За 7 дней</div></div>'
      + '</div>'
      + '<div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding:0 4px;margin-bottom:16px;border-bottom:1px solid var(--border)">' + bars + '</div>'
      + (topPagesHtml ? '<div><p style="font-size:.78rem;font-weight:600;color:var(--t2);margin-bottom:8px">Популярные страницы</p>' + topPagesHtml + '</div>' : '')
      + '</div></div>';
  })() : '';

  const newsList = (recentNews.data||[]).map(n => `
    <div class="dash-item" onclick="location.hash='news';navigate('news')">
      ${n.image ? `<img class="dash-item-img" src="${escapeHtml(n.image)}" loading="lazy" onerror="this.style.display='none'">` : '<div class="dash-item-img-ph">📰</div>'}
      <div class="dash-item-txt">
        <div class="dash-item-title">${escapeHtml(n.titleRu||'Без заголовка')}</div>
        <div class="dash-item-meta">${n.status==='published'?'✓ Опубликовано':'⬤ Черновик'} · ${n.createdAt?new Date(n.createdAt).toLocaleDateString('ru-RU'):''}</div>
      </div>
    </div>`).join('') || '<div class="empty" style="padding:24px"><p>Нет новостей</p></div>';

  const eventsList = (recentEvents.data||[]).map(n => `
    <div class="dash-item" onclick="location.hash='events';navigate('events')">
      ${n.image ? `<img class="dash-item-img" src="${escapeHtml(n.image)}" loading="lazy" onerror="this.style.display='none'">` : '<div class="dash-item-img-ph">📅</div>'}
      <div class="dash-item-txt">
        <div class="dash-item-title">${escapeHtml(n.titleRu||'Без названия')}</div>
        <div class="dash-item-meta">${n.date?new Date(n.date).toLocaleDateString('ru-RU'):''} ${n.location?`· ${escapeHtml(n.location)}`:''}</div>
      </div>
    </div>`).join('') || '<div class="empty" style="padding:24px"><p>Нет мероприятий</p></div>';

  const actions = [
    {icon:'📰',label:'Добавить новость',fn:"location.hash='news';navigate('news');setTimeout(()=>openDrawer('news'),100)"},
    {icon:'📅',label:'Добавить мероприятие',fn:"location.hash='events';navigate('events');setTimeout(()=>openDrawer('events'),100)"},
    {icon:'🖼',label:'Загрузить фото',fn:"location.hash='gallery';navigate('gallery');setTimeout(()=>openDrawer('gallery'),100)"},
    {icon:'👤',label:'Добавить человека',fn:"location.hash='people';navigate('people');setTimeout(()=>openDrawer('people'),100)"}
  ];

  c.innerHTML = `
    <div class="page-head">
      <div class="page-head-txt">
        <h2>Добрый день 👋</h2>
        <p>Панель управления — Дирекция спорта Кыргызстана</p>
      </div>
    </div>
    <div class="kpi-row">
      ${kpis.map(k=>`<div class="kpi"><div class="kpi-icon ${k.cls}">${k.icon}</div><div class="kpi-info"><div class="kpi-val">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div></div>`).join('')}
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <div class="dash-card-head">
          <h3>Последние новости</h3>
          <button class="btn btn-outline btn-sm" onclick="location.hash='news';navigate('news')">Все →</button>
        </div>
        <div class="dash-items">${newsList}</div>
        <div class="dash-actions">
          ${actions.slice(0,2).map(a=>`<button class="dash-action-btn" onclick="${a.fn}"><span style="font-size:1.1rem">${a.icon}</span>${a.label}</button>`).join('')}
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-head">
          <h3>Ближайшие мероприятия</h3>
          <button class="btn btn-outline btn-sm" onclick="location.hash='events';navigate('events')">Все →</button>
        </div>
        <div class="dash-items">${eventsList}</div>
        <div class="dash-actions">
          ${actions.slice(2).map(a=>`<button class="dash-action-btn" onclick="${a.fn}"><span style="font-size:1.1rem">${a.icon}</span>${a.label}</button>`).join('')}
        </div>
      </div>
    </div>
    ${statsHtml}`;
}

/* ── List section ── */
async function renderSection(section) {
  const cfg = CFG[section];
  const pg = currentPage[section] || 1;
  const search = currentSearch[section] || '';
  const filter = currentFilter[section] || '';
  const c = document.getElementById('content');
  c.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';

  const params = new URLSearchParams({page:pg, limit:20});
  if (search) params.set('search', search);
  if (filter && cfg.filterKey) params.set(cfg.filterKey, filter);

  let result;
  try { result = await api(`${cfg.api}?${params}`); }
  catch { toast('Ошибка загрузки данных', 'e'); return; }

  const {data, total} = result;
  const totalPages = Math.ceil((total||0)/20);

  const filterChips = (cfg.filterOpts||[]).map(o =>
    `<button class="filter-chip${filter===o.v?' active':''}" onclick="setFilter('${section}','${o.v}')">${o.l}</button>`
  ).join('');

  if (cfg.viewType === 'grid') {
    c.innerHTML = `
      <div class="page-head">
        <div class="page-head-txt"><h2>${cfg.title}</h2><p>${cfg.hint}</p></div>
        <div class="page-head-actions">
          <button class="btn btn-primary" onclick="openDrawer('${section}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Загрузить фото
          </button>
        </div>
      </div>
      <div class="data-card">
        <div class="toolbar">
          <div class="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="search-${section}" placeholder="Поиск по подписи..." value="${search}" oninput="debounce('${section}')">
          </div>
          ${filterChips}
        </div>
        ${data.length ? `<div class="gal-grid">${data.map(item=>`
          <div class="gal-item">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.titleRu||'')}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=60'">
            <div class="gal-over">
              <button class="btn btn-icon" style="background:rgba(255,255,255,.9)" onclick="openDrawer('${section}','${item.id}')" title="Изменить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-icon-danger" style="background:rgba(255,255,255,.9)" onclick="confirmDel('${section}','${item.id}')" title="Удалить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            <div class="gal-cap">${escapeHtml(item.titleRu||'')}</div>
          </div>`).join('')}</div>` : '<div class="empty"><div class="empty-icon">🖼</div><h4>Нет фотографий</h4><p>Загрузите первое фото</p></div>'}
        ${totalPages>1 ? renderPager(section,pg,totalPages,total) : ''}
      </div>`;
    return;
  }

  const colsH = cfg.cols.map(c => `<th>${c.label}</th>`).join('');
  const rowsH = data.length ? data.map(item => `<tr>
    ${cfg.cols.map(col => `<td>${renderCell(col, item)}</td>`).join('')}
    <td><div class="td-act">
      ${section === 'sports' ? `<button class="btn btn-icon" onclick="openGalleryManager('sports',${JSON.stringify(item.id)},${JSON.stringify(item.nameRu||'')})" title="Фото галерея" style="color:var(--primary)">📸</button>` : ''}
      <button class="btn btn-icon" onclick="openDrawer('${section}','${item.id}')" title="Редактировать">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="btn btn-icon-danger" onclick="confirmDel('${section}','${item.id}')" title="Удалить">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div></td>
  </tr>`).join('') : `<tr><td colspan="${cfg.cols.length+1}"><div class="empty"><div class="empty-icon">📄</div><h4>Пусто</h4><p>Добавьте первую запись</p></div></td></tr>`;

  c.innerHTML = `
    <div class="page-head">
      <div class="page-head-txt"><h2>${cfg.title}</h2><p>${cfg.hint}</p></div>
      <div class="page-head-actions">
        <button class="btn btn-primary" onclick="openDrawer('${section}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить
        </button>
      </div>
    </div>
    <div class="data-card">
      <div class="toolbar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="search-${section}" placeholder="Поиск..." value="${search}" oninput="debounce('${section}')">
        </div>
        ${filterChips}
      </div>
      <div class="table-wrap"><table><thead><tr>${colsH}<th>Действия</th></tr></thead><tbody>${rowsH}</tbody></table></div>
      ${totalPages>1 ? renderPager(section,pg,totalPages,total) : ''}
    </div>`;
}

function renderCell(col, item) {
  const v = item[col.key];
  if (col.type === 'img') { const s = item[col.key]||item.image||item.photo; return s ? `<img class="td-thumb" src="${escapeHtml(s)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=60'">` : '<div class="td-thumb-ph">📷</div>'; }
  if (col.type === 'name') return `<div class="td-name">${escapeHtml(v||'—')}</div><div class="td-meta">${escapeHtml(item.titleKy||'')}</div>`;
  if (col.type === 'badge') {
    const sv = String(v);
    const l = col.map?.[sv] ?? col.map?.[v] ?? sv ?? '—';
    const clsMap = {published:'b-pub', draft:'b-draft', archived:'b-archived', athlete:'b-athlete', staff:'b-staff', coach:'b-coach', true:'b-pub', false:'b-draft', active:'b-pub', retired:'b-draft', live:'b-live', scheduled:'b-scheduled', ended:'b-ended'};
    const cls = clsMap[sv] || clsMap[v] || 'b-draft';
    return `<span class="badge ${cls}">${escapeHtml(l)}</span>`;
  }
  if (col.type === 'date') return v ? new Date(v).toLocaleDateString('ru-RU') : '—';
  if (col.map) return escapeHtml(col.map[v]||v||'—');
  return escapeHtml(v||'—');
}

function renderPager(section, pg, total, count) {
  const btns = Array.from({length:total},(_,i)=>`<button class="pager-btn${i+1===pg?' active':''}" onclick="currentPage['${section}']=${i+1};renderSection('${section}')">${i+1}</button>`).join('');
  return `<div class="pager"><span class="pager-info">Всего: ${count} записей</span><div class="pager-btns">${btns}</div></div>`;
}

function setFilter(section, val) { currentFilter[section]=val; currentPage[section]=1; renderSection(section); }
function debounce(section) {
  clearTimeout(searchTimers[section]);
  searchTimers[section] = setTimeout(() => {
    currentSearch[section] = document.getElementById(`search-${section}`)?.value||'';
    currentPage[section]=1; renderSection(section);
  }, 350);
}

/* ── Drawer ── */
async function openDrawer(section, id) {
  const cfg = CFG[section];
  drawerSection = section; drawerItemId = id||null;
  const sectionRatios = { news: 16/9, events: 16/9, gallery: 4/3, people: 3/4, slides: 16/9, livestreams: 16/9 };
  currentCropRatio = sectionRatios[section] || 16/9;
  document.querySelectorAll('.crop-ratio-btn').forEach((btn, i) => {
    btn.classList.toggle('active', [16/9, 4/3, 1/1, 3/4][i] === currentCropRatio);
  });
  let item = null;
  if (id) {
    try { item = await api(`${cfg.api}/${id}`); }
    catch { toast('Ошибка загрузки', 'e'); return; }
  }

  document.getElementById('drawer-title').textContent = id ? `Редактировать — ${cfg.title}` : `Добавить — ${cfg.title}`;
  document.getElementById('drawer-hint').textContent = id ? 'Измените нужные поля и нажмите «Сохранить»' : 'Заполните форму и нажмите «Добавить»';

  const langFields = {ru: cfg.fields.filter(f=>f.lang==='ru'), ky: cfg.fields.filter(f=>f.lang==='ky')};
  const genFields = cfg.fields.filter(f=>f.noLang&&f.type!=='upload');
  const uploadField = cfg.fields.find(f=>f.type==='upload');
  const hasLang = langFields.ru.length > 0;

  const existingImg = item ? (item.image||item.photo) : null;

  let body = `<form id="drawer-form" onsubmit="submitDrawer(event)">`;

  if (hasLang) {
    body += `<div class="lang-tabs" id="lang-tabs">
      <button type="button" class="lang-tab active" onclick="swLang('ru',this)">🇷🇺 Русский</button>
      <button type="button" class="lang-tab" onclick="swLang('ky',this)">🇰🇬 Кыргызча</button>
    </div>
    <div class="lang-pane active" data-lang="ru">${langFields.ru.map(f=>renderField(f,item)).join('')}</div>
    <div class="lang-pane" data-lang="ky">${langFields.ky.map(f=>renderField(f,item)).join('')}</div>`;
  }

  if (genFields.length) {
    body += `<div class="form-divider"></div>`;
    body += genFields.map(f=>renderField(f,item)).join('');
  }

  // Status toggle — only when no <select name="status"> already exists in the form
  const statusInSelect = genFields.some(f => f.key === 'status');
  const hasStatusCol = cfg.cols && cfg.cols.some(c => c.key === 'status');
  const usesActiveField = cfg.fields.some(f => f.key === 'active');
  if (!statusInSelect && hasStatusCol && !usesActiveField) {
    const isPublished = item?.status === 'published';
    body += `
    <div class="form-field">
      <label class="form-lbl">Статус публикации</label>
      <div class="status-toggle" id="status-toggle" onclick="toggleStatus(this)">
        <div class="toggle-track ${isPublished?'on':''}"><div class="toggle-thumb"></div></div>
        <span class="toggle-label ${isPublished?'on':''}">${isPublished?'Опубликовано':'Черновик'}</span>
        <input type="hidden" name="status" id="status-val" value="${isPublished?'published':'draft'}">
      </div>
    </div>`;
  }

  if (uploadField) body += renderField(uploadField, item);
  body += `</form>`;

  document.getElementById('drawer-body').innerHTML = body;
  const autoSaveBar = section === 'news'
    ? `<span id="autosave-bar" class="autosave-bar">Автосохранение каждые 15 сек</span>` : '';
  document.getElementById('drawer-foot').innerHTML = `
    ${autoSaveBar}
    <button class="btn btn-outline" onclick="closeDrawer()">Отмена</button>
    <button class="btn btn-save" onclick="triggerDrawerSubmit()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ${id ? 'Сохранить изменения' : 'Добавить запись'}
    </button>`;
  if (section === 'news') startAutoSave(section);

  setupGridDragDrop();
  document.getElementById('drawer-bg').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-body').scrollTop = 0;
}

function renderField(f, item) {
  const v = item ? (item[f.key]||'') : '';
  const req = f.req ? `<span>*</span>` : '';
  if (f.type === 'editor') {
    return `<div class="form-field">
      <label class="form-lbl">${f.label}${req}</label>
      <div class="editor-wrap">
        <div class="editor-bar">
          <button type="button" class="editor-btn" onclick="edCmd('bold')" title="Жирный"><b>B</b></button>
          <button type="button" class="editor-btn" onclick="edCmd('italic')" title="Курсив"><i>I</i></button>
          <div class="editor-sep"></div>
          <button type="button" class="editor-btn" onclick="edCmd('formatBlock','h3')">H3</button>
          <button type="button" class="editor-btn" onclick="edCmd('insertUnorderedList')">≡</button>
          <button type="button" class="editor-btn" onclick="edCmd('removeFormat')">✕</button>
        </div>
        <div class="editor-area" contenteditable="true" data-placeholder="${f.ph||''}" data-name="${f.key}" oninput="syncEd(this)">${v}</div>
        <input type="hidden" name="${f.key}" value="${v}">
      </div>
    </div>`;
  }
  if (f.type === 'textarea') return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label><textarea class="form-input" name="${f.key}" placeholder="${f.ph||''}" rows="4">${escapeHtml(v)}</textarea></div>`;
  if (f.type === 'select') return `<div class="form-field"><label class="form-lbl">${f.label}</label><select class="form-input form-select" name="${f.key}">${(f.opts||[]).map(o=>`<option value="${o.v}"${String(v)===String(o.v)?' selected':''}>${o.l}</option>`).join('')}</select></div>`;
  if (f.type === 'date') return `<div class="form-field"><label class="form-lbl">${f.label}</label><input type="date" class="form-input" name="${f.key}" value="${escapeHtml(v)}"></div>`;
  if (f.type === 'datetime-local') return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label><input type="datetime-local" class="form-input" name="${f.key}" value="${escapeHtml(v)}"></div>`;
  if (f.type === 'number') return `<div class="form-field"><label class="form-lbl">${f.label}</label><input type="number" class="form-input" name="${f.key}" value="${escapeHtml(v)}" min="1"></div>`;
  if (f.type === 'icon-upload') {
    const previewHtml = v
      ? `<img src="${escapeHtml(v)}" style="max-width:56px;max-height:56px;object-fit:contain;display:block">`
      : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5" fill="#ccc"/><polyline points="21 15 16 10 5 21"/></svg>`;
    return `<div class="form-field">
      <label class="form-lbl">${escapeHtml(f.label)}</label>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:4px">
        <div id="icon-preview-${f.key}" style="width:64px;height:64px;border:1.5px solid var(--border,#e5e7eb);border-radius:10px;overflow:hidden;background:#f8f8f8;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${previewHtml}
        </div>
        <div>
          <label class="btn btn-outline btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Загрузить иконку
            <input type="file" id="iconFile-${f.key}" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none" onchange="uploadSportIcon('${escapeHtml(f.key)}',this)">
          </label>
          <input type="hidden" name="${f.key}" id="iconVal-${f.key}" value="${escapeHtml(v)}">
          <p style="margin-top:6px;font-size:.75rem;color:#9ca3af">PNG, JPG, WebP — до 2 МБ.<br>Нажмите «Сохранить» после загрузки иконки.</p>
        </div>
      </div>
    </div>`;
  }
  if (f.type === 'upload') {
    const existingImages = item
      ? [item[f.key], item.image, item.photo, ...(item.images || [])].filter(Boolean)
      : [];
    const urlInput = drawerSection === 'slides' ? `
      <div class="form-field" style="margin-top:8px">
        <label class="form-lbl">URL фото слайда</label>
        <input type="text" class="form-input" name="imageUrl"
               placeholder="https://images.unsplash.com/..."
               value="${item?.imageUrl || (existingImages[0] && existingImages[0].startsWith('http') ? existingImages[0] : '') || ''}">
      </div>` : '';
    return `
      <div class="form-field">
        <label class="form-lbl">${f.label}${f.req ? '<span>*</span>' : ''}</label>
        <div class="img-grid" id="imgGrid-${f.key}">
          ${existingImages.map((src, i) => `
            <div class="img-grid-item">
              <img src="${escapeHtml(src)}" alt="Фото ${i + 1}" onerror="this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=60'">
              <button type="button" class="img-grid-remove" onclick="removeGridImage(this,'${f.key}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              ${i === 0 ? '<span class="img-grid-main-badge">Обложка</span>' : ''}
            </div>`).join('')}
          <div class="img-grid-add" id="imgGridAdd-${f.key}" onclick="document.getElementById('imgInput-${f.key}').click()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>Добавить фото</span>
          </div>
        </div>
        <input type="file" id="imgInput-${f.key}" name="${f.key}" accept="image/*" multiple style="display:none" onchange="handleImageSelect(this,'${f.key}')">
        <div class="img-url-row">
          <input type="text" class="form-input img-url-input" id="imgUrl-${f.key}" placeholder="Или вставьте ссылку на фото (https://...)">
          <button type="button" class="btn btn-outline btn-sm" onclick="addImageFromUrl('${f.key}')">Добавить</button>
        </div>
        <div id="imgHidden-${f.key}">
          ${existingImages.map((src, i) => `<input type="hidden" name="${i === 0 ? f.key : 'images[]'}" value="${escapeHtml(src)}">`).join('')}
        </div>
        ${urlInput}
      </div>`;
  }
  return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label><input type="text" class="form-input" name="${f.key}" value="${escapeHtml(v)}" placeholder="${f.ph||''}"></div>`;
}

function closeDrawer() {
  stopAutoSave();
  document.getElementById('drawer-bg').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  drawerSection = null; drawerItemId = null;
}

function swLang(lang, btn) {
  document.querySelectorAll('#lang-tabs .lang-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('#drawer-body .lang-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`#drawer-body .lang-pane[data-lang="${lang}"]`)?.classList.add('active');
}

function toggleStatus(wrap) {
  const track = wrap.querySelector('.toggle-track');
  const label = wrap.querySelector('.toggle-label');
  const inp = document.getElementById('status-val');
  const on = track.classList.toggle('on');
  label.classList.toggle('on', on);
  label.textContent = on ? 'Опубликовано' : 'Черновик';
  inp.value = on ? 'published' : 'draft';
}

function edCmd(cmd, val=null) { document.execCommand(cmd, false, val); }
function syncEd(el) { el.closest('.editor-wrap').querySelector('input[type=hidden]').value = el.innerHTML; }

/* ── Image grid upload ── */
function handleImageSelect(input, fieldKey) {
  const files = Array.from(input.files);
  if (!files.length) return;
  input.value = '';
  let index = 0;
  function processNext() {
    if (index >= files.length) return;
    const file = files[index++];
    if (!file.type.startsWith('image/')) { processNext(); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      openCropper(e.target.result, (croppedUrl, blob) => {
        addImageToGrid(fieldKey, croppedUrl, true);
        if (!croppedBlobs[fieldKey]) croppedBlobs[fieldKey] = [];
        croppedBlobs[fieldKey].push({ blob, name: file.name });
        processNext();
      });
    };
    reader.readAsDataURL(file);
  }
  processNext();
}

function updateCropPreview() {
  if (!cropperInstance) return;
  const canvas = document.getElementById('cropPreviewCanvas');
  const box = document.getElementById('cropPreviewBox');
  if (!canvas || !box) return;
  try {
    const previewW = box.clientWidth || 200;
    const ratio = currentCropRatio || 16/9;
    const previewH = Math.round(previewW / ratio);
    const cropped = cropperInstance.getCroppedCanvas({ width: previewW * 2, height: previewH * 2 });
    if (!cropped) return;
    canvas.width = previewW;
    canvas.height = previewH;
    canvas.style.width = previewW + 'px';
    canvas.style.height = previewH + 'px';
    canvas.getContext('2d').drawImage(cropped, 0, 0, previewW, previewH);
  } catch(e) {}
}

function openCropper(imageSrc, callback) {
  cropCallback = callback;
  const modal = document.getElementById('cropModal');
  const img   = document.getElementById('cropImage');
  if (!modal || !img) { callback(imageSrc, null); return; }

  // Destroy previous instance and reset image completely
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  img.onload  = null;
  img.onerror = null;
  img.src = '';

  // Show modal BEFORE loading image — CropperJS requires visible element
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  function initCropper() {
    img.onload = null; img.onerror = null;
    if (cropperInstance) return;
    cropperInstance = new Cropper(img, {
      aspectRatio: currentCropRatio,
      viewMode: 2,
      dragMode: 'move',
      autoCropArea: 0.85,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      ready() { updateCropPreview(); },
      crop()  { updateCropPreview(); },
    });
  }

  // Attach onload BEFORE setting src (prevents race condition with dataURLs)
  img.onerror = () => { img.onerror = null; toast('Ошибка загрузки фото', 'e'); cancelCrop(); };
  img.onload  = initCropper;
  img.src     = imageSrc;

  // Safety fallback: dataURLs can load synchronously before onload fires
  requestAnimationFrame(() => {
    if (!cropperInstance && img.complete && img.naturalWidth) initCropper();
  });
}

function setCropRatio(ratio, btn) {
  currentCropRatio = ratio;
  document.querySelectorAll('.crop-ratio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (cropperInstance) {
    cropperInstance.setAspectRatio(ratio);
    setTimeout(updateCropPreview, 100);
  }
}

function applyCrop() {
  if (!cropperInstance) return;
  const btn = document.getElementById('cropApplyBtn');
  btn.disabled = true; btn.textContent = 'Обработка...';
  const h = Math.round(1200 / currentCropRatio);
  const canvas = cropperInstance.getCroppedCanvas({ width: 1200, height: h, imageSmoothingEnabled: true, imageSmoothingQuality: 'high', fillColor: '#fff' });
  if (!canvas) { toast('Ошибка обрезки', 'e'); btn.disabled = false; btn.textContent = 'Применить обрезку'; return; }
  const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
  canvas.toBlob((blob) => {
    if (cropCallback) cropCallback(croppedUrl, blob);
    cancelCrop();
    btn.disabled = false; btn.textContent = 'Применить обрезку';
  }, 'image/jpeg', 0.92);
}

function cancelCrop() {
  const modal = document.getElementById('cropModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  cropCallback = null;
}

function attachCroppedBlobs(fd) {
  Object.keys(croppedBlobs).forEach(fieldKey => {
    croppedBlobs[fieldKey].forEach((item, i) => {
      const filename = `cropped_${Date.now()}_${i}.jpg`;
      if (i === 0) { fd.set(fieldKey, item.blob, filename); }
      else { fd.append('images[]', item.blob, filename); }
    });
    delete croppedBlobs[fieldKey];
  });
}

function addImageToGrid(fieldKey, src, isFile) {
  const grid = document.getElementById(`imgGrid-${fieldKey}`);
  const addBtn = document.getElementById(`imgGridAdd-${fieldKey}`);
  const hiddenContainer = document.getElementById(`imgHidden-${fieldKey}`);
  if (!grid || !addBtn) return;
  const isFirst = grid.querySelectorAll('.img-grid-item').length === 0;
  const div = document.createElement('div');
  div.className = 'img-grid-item';
  div.dataset.src = src;
  div.innerHTML = `
    <img src="${src}" alt="Фото" onerror="this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=60'">
    <button type="button" class="img-grid-remove" onclick="removeGridImage(this,'${fieldKey}')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    ${isFirst ? '<span class="img-grid-main-badge">Обложка</span>' : ''}`;
  grid.insertBefore(div, addBtn);
  if (!isFile && hiddenContainer) {
    const inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = isFirst ? fieldKey : 'images[]';
    inp.value = src;
    hiddenContainer.appendChild(inp);
  }
  updateMainBadge(fieldKey);
}

function addImageFromUrl(fieldKey) {
  const urlInput = document.getElementById(`imgUrl-${fieldKey}`);
  if (!urlInput) return;
  const url = urlInput.value.trim();
  if (!url || !url.startsWith('http')) { toast('Введите корректный URL', 'e'); return; }
  addImageToGrid(fieldKey, url, false);
  urlInput.value = '';
}

function removeGridImage(btn, fieldKey) {
  btn.closest('.img-grid-item')?.remove();
  updateMainBadge(fieldKey);
  rebuildHiddenInputs(fieldKey);
}

function rebuildHiddenInputs(fieldKey) {
  const container = document.getElementById(`imgHidden-${fieldKey}`);
  const grid = document.getElementById(`imgGrid-${fieldKey}`);
  if (!container || !grid) return;
  container.innerHTML = '';
  grid.querySelectorAll('.img-grid-item').forEach((item, i) => {
    const src = item.dataset.src || item.querySelector('img')?.src;
    if (!src || src.startsWith('data:')) return;
    const inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = i === 0 ? fieldKey.replace('imgGrid-', '') : 'images[]';
    inp.value = src;
    container.appendChild(inp);
  });
}

function updateMainBadge(fieldKey) {
  const grid = document.getElementById(`imgGrid-${fieldKey}`);
  if (!grid) return;
  grid.querySelectorAll('.img-grid-item').forEach((item, i) => {
    const existing = item.querySelector('.img-grid-main-badge');
    if (i === 0) {
      if (!existing) { const b = document.createElement('span'); b.className = 'img-grid-main-badge'; b.textContent = 'Обложка'; item.appendChild(b); }
    } else { existing?.remove(); }
  });
}

function setupGridDragDrop() {
  document.querySelectorAll('.img-grid').forEach(grid => {
    const fieldKey = grid.id.replace('imgGrid-', '');
    grid.addEventListener('dragover', e => { e.preventDefault(); grid.classList.add('drag-over'); });
    ['dragleave', 'dragend'].forEach(ev => grid.addEventListener(ev, () => grid.classList.remove('drag-over')));
    grid.addEventListener('drop', e => {
      e.preventDefault();
      grid.classList.remove('drag-over');
      Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => addImageToGrid(fieldKey, ev.target.result, true);
        reader.readAsDataURL(file);
      });
    });
  });
}

/* ── Trigger drawer form submit (cross-browser) ── */
function triggerDrawerSubmit() {
  const form = document.getElementById('drawer-form');
  if (!form) return;
  if (typeof form.requestSubmit === 'function') {
    // Modern browsers: triggers validation + submit event
    form.requestSubmit();
  } else {
    // Fallback for Safari < 16: dispatch submit event manually
    // onsubmit="submitDrawer(event)" will be invoked by the browser
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
}

/* ── Submit ── */
async function submitDrawer(e) {
  e.preventDefault();
  const cfg = CFG[drawerSection];
  // Ensure rich-text editors are synced into their hidden inputs before reading FormData
  e.target.querySelectorAll('.editor-area').forEach(syncEd);
  const btn = document.querySelector('#drawer-foot .btn-save');
  btn.disabled=true; btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .7s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Сохранение...';

  const fd = new FormData(e.target);
  attachCroppedBlobs(fd);
  const url = drawerItemId ? `${cfg.api}/${drawerItemId}` : cfg.api;
  const method = drawerItemId ? 'PUT' : 'POST';
  const hasUpload = cfg.fields && cfg.fields.some(f => f.type === 'upload');
  try {
    if (hasUpload) {
      await apiFd(url, method, fd);
    } else {
      await api(url, method, Object.fromEntries(fd.entries()));
    }
    closeDrawer();
    toast(drawerItemId ? 'Изменения сохранены' : 'Запись добавлена');
    drawerSection.startsWith('about-') ? navigate('about') : renderSection(drawerSection);
    loadBadges();
  } catch(ex) { toast(ex.message||'Ошибка сохранения','e'); }
  finally { btn.disabled=false; btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> '+(drawerItemId?'Сохранить изменения':'Добавить запись'); }
}

/* ── Auto-save Draft ── */
let _autoSaveTimer = null;
let _autoSaveSection = null;

function startAutoSave(section) {
  _autoSaveSection = section;
  stopAutoSave();
  _autoSaveTimer = setInterval(() => {
    const form = document.getElementById('drawer-form');
    if (!form || _autoSaveSection !== 'news') return;
    form.querySelectorAll('.editor-area').forEach(syncEd);
    const fd = new FormData(form);
    const draft = {};
    for (const [k, v] of fd.entries()) draft[k] = v;
    draft._savedAt = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    draft._id = drawerItemId;
    localStorage.setItem('news_autosave', JSON.stringify(draft));
    const bar = document.getElementById('autosave-bar');
    if (bar) bar.textContent = `Автосохранение: ${draft._savedAt}`;
  }, 15000);
}

function stopAutoSave() {
  if (_autoSaveTimer) { clearInterval(_autoSaveTimer); _autoSaveTimer = null; }
}

/* ── Delete ── */
function confirmDel(section, id) {
  const wrap = document.getElementById('dialog-wrap');
  document.getElementById('dialog').innerHTML = `
    <div class="dialog-icon">🗑️</div>
    <h3>Удалить запись?</h3>
    <p>Действие нельзя отменить. Данные будут удалены навсегда.</p>
    <div class="dialog-btns">
      <button class="btn btn-outline" onclick="closeConfirm()">Отмена</button>
      <button class="btn" style="background:#DC2626;color:#fff" onclick="doDelete('${section}','${id}')">Удалить</button>
    </div>`;
  wrap.classList.remove('hidden');
}

async function doDelete(section, id) {
  try {
    await api(`${CFG[section].api}/${id}`, 'DELETE');
    closeConfirm(); toast('Запись удалена');
    section.startsWith('about-') ? navigate('about') : renderSection(section); loadBadges();
  } catch { toast('Ошибка удаления','e'); }
}

function closeConfirm() { document.getElementById('dialog-wrap').classList.add('hidden'); }

/* ── HTML escape (coerces any type to string — safe for numbers/dates) ── */
function escapeHtml(s) { return String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ── Contacts (inbox) ── */
function escA(s) { return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function fmtDt(s) {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d) ? '' : d.toLocaleDateString('ru-RU', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

async function renderContacts() {
  const c = document.getElementById('content');
  c.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';
  let data = [], total = 0;
  try {
    const r = await api('/api/contact?limit=100');
    data = r.data || [];
    total = r.total || 0;
  } catch { toast('Ошибка загрузки','e'); return; }

  const unread = data.filter(m => !m.read).length;

  c.innerHTML = `
    <div class="page-head">
      <div class="page-head-txt">
        <h2>Обращения ${unread > 0 ? `<span style="background:#e53e3e;color:#fff;padding:2px 8px;border-radius:12px;font-size:.75rem;vertical-align:middle">${unread} новых</span>` : ''}</h2>
        <p>Сообщения с формы обратной связи — всего: ${total}</p>
      </div>
    </div>
    ${!data.length
      ? '<p style="text-align:center;padding:80px;opacity:.4;font-size:1.1rem">Обращений пока нет</p>'
      : `<div class="table-wrap">
          <table class="data-table" style="table-layout:fixed;width:100%">
            <colgroup>
              <col style="width:8px">
              <col style="width:150px">
              <col style="width:180px">
              <col style="width:160px">
              <col>
              <col style="width:130px">
              <col style="width:80px">
            </colgroup>
            <thead><tr>
              <th></th>
              <th>Имя</th>
              <th>Email</th>
              <th>Тема</th>
              <th>Сообщение</th>
              <th>Дата</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${data.map(m => `
                <tr id="crow-${escA(m.id)}" style="${m.read ? '' : 'font-weight:600;background:var(--color-accent,#eef2ff)'}">
                  <td style="padding:0 6px">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${m.read ? '#ccc' : '#e53e3e'}"></span>
                  </td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escA(m.name)}">${escA(m.name)}</td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    <a href="mailto:${escA(m.email)}" style="color:var(--color-primary)">${escA(m.email)}</a>
                  </td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escA(m.subject)}">${escA(m.subject || '—')}</td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escA(m.message)}">${escA(m.message)}</td>
                  <td style="font-size:.8rem;color:#666;white-space:nowrap">${fmtDt(m.createdAt)}</td>
                  <td style="white-space:nowrap;text-align:right">
                    ${!m.read ? `<button class="btn btn-icon" title="Прочитано" onclick="markContactRead('${escA(m.id)}')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>` : ''}
                    <button class="btn btn-icon-danger" title="Удалить" style="color:#e53e3e" onclick="deleteContact('${escA(m.id)}')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}`;
}

async function markContactRead(id) {
  try {
    await api(`/api/contact/${id}/read`, 'PATCH', {});
    const row = document.getElementById(`crow-${id}`);
    if (row) {
      row.style.fontWeight = '';
      row.style.background = '';
      const dot = row.querySelector('span[style*="border-radius:50%"]');
      if (dot) dot.style.background = '#ccc';
      const readBtn = row.querySelector('.btn-icon');
      if (readBtn && readBtn.title === 'Прочитано') readBtn.remove();
    }
    toast('Отмечено как прочитанное');
    loadBadges();
  } catch { toast('Ошибка','e'); }
}

async function deleteContact(id) {
  if (!confirm('Удалить это обращение?')) return;
  try {
    await api(`/api/contact/${id}`, 'DELETE');
    document.getElementById(`crow-${id}`)?.remove();
    toast('Удалено');
    loadBadges();
  } catch { toast('Ошибка','e'); }
}

/* ── Settings ── */
async function renderSettings() {
  const c = document.getElementById('content');
  c.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';
  let s;
  try { s = await api('/api/settings'); } catch { toast('Ошибка загрузки','e'); return; }

  const logoSrc = s.logoPath || '/logo.png';

  c.innerHTML = `
    <div class="page-head"><div class="page-head-txt"><h2>Настройки</h2><p>Логотип, контакты, социальные сети и безопасность</p></div></div>
    <div style="margin-bottom:12px;padding:12px 16px;background:#f0f7ff;border:1px solid #c3dafe;border-radius:10px;font-size:.875rem;color:#3b5fc0">
      💡 Чтобы изменить <strong>обратный отсчёт</strong> и <strong>статистику</strong> на главной — перейдите в раздел <a href="#homepage" onclick="navigate('homepage')" style="color:#3b5fc0;font-weight:600">🏠 Главная страница</a>
    </div>
    <div class="settings-grid">

      <!-- Логотип -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="settings-card-head"><h3>Логотип сайта</h3><p>Загрузите свой логотип (PNG, JPG, WebP, SVG — до 3 МБ)</p></div>
        <div class="settings-card-body">
          <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
            <div id="logo-preview-wrap" style="width:90px;height:90px;border:2px dashed var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;background:#f8f8f8;overflow:hidden;flex-shrink:0">
              <img id="logo-preview-img" src="${escapeHtml(logoSrc)}" alt="Логотип" style="max-width:80px;max-height:80px;object-fit:contain" onerror="this.style.display='none'">
            </div>
            <div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Выбрать файл
                <input type="file" id="logo-file-input" accept="image/*" style="display:none" onchange="previewLogo(this)">
              </label>
              <button class="btn btn-primary btn-sm" style="margin-left:8px" onclick="uploadLogo()">Загрузить</button>
              <p style="margin-top:8px;font-size:.8rem;color:#888">После загрузки логотип появится в шапке и футере сайта</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Контакты -->
      <div class="settings-card">
        <div class="settings-card-head"><h3>Контактная информация</h3><p>Адрес, телефон и почта</p></div>
        <div class="settings-card-body">
          <form onsubmit="saveSettings(event)">
            <div class="form-field"><label class="form-lbl">Email</label><input class="form-input" name="email" value="${escapeHtml(s.email||'')}" type="email"></div>
            <div class="form-field"><label class="form-lbl">Телефон</label><input class="form-input" name="phone" value="${escapeHtml(s.phone||'')}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (RU)</label><input class="form-input" name="addressRu" value="${escapeHtml(s.address?.ru||'')}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (KY)</label><input class="form-input" name="addressKy" value="${escapeHtml(s.address?.ky||'')}"></div>
            <div class="form-field"><label class="form-lbl">Широта</label><input class="form-input" id="adminMapLat" name="mapLat" type="number" step="any" value="${s.mapLat!=null?s.mapLat:42.8736}" placeholder="42.8736" oninput="adminMapUpdate()"></div>
            <div class="form-field"><label class="form-lbl">Долгота</label><input class="form-input" id="adminMapLon" name="mapLon" type="number" step="any" value="${s.mapLon!=null?s.mapLon:74.5907}" placeholder="74.5907" oninput="adminMapUpdate()"></div>
            <div style="font-size:.8rem;color:var(--t2);margin:-6px 0 10px;line-height:1.5">Нажмите на карту или перетащите маркер — координаты обновятся автоматически</div>
            <div id="adminMapPicker" style="height:260px;border-radius:10px;overflow:hidden;margin-bottom:14px;border:1px solid var(--border)"></div>
            <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
          </form>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Социальные сети -->
        <div class="settings-card">
          <div class="settings-card-head"><h3>Социальные сети</h3><p>Ссылки отображаются в подвале сайта</p></div>
          <div class="settings-card-body">
            <form onsubmit="saveSettings(event)">
              <div class="form-field">
                <label class="form-lbl" style="display:flex;align-items:center;gap:6px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </label>
                <input class="form-input" name="socialTelegram" value="${escapeHtml(s.socialTelegram||'')}" placeholder="https://t.me/channel">
              </div>
              <div class="form-field">
                <label class="form-lbl" style="display:flex;align-items:center;gap:6px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </label>
                <input class="form-input" name="socialInstagram" value="${escapeHtml(s.socialInstagram||'')}" placeholder="https://instagram.com/account">
              </div>
              <div class="form-field">
                <label class="form-lbl" style="display:flex;align-items:center;gap:6px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </label>
                <input class="form-input" name="socialYoutube" value="${escapeHtml(s.socialYoutube||'')}" placeholder="https://youtube.com/@channel">
              </div>
              <div class="form-field">
                <label class="form-lbl">ВКонтакте</label>
                <input class="form-input" name="socialVk" value="${escapeHtml(s.socialVk||'')}" placeholder="https://vk.com/...">
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
            </form>
          </div>
        </div>

        <!-- Безопасность -->
        <div class="settings-card">
          <div class="settings-card-head"><h3>Безопасность</h3><p>Изменить пароль администратора</p></div>
          <div class="settings-card-body">
            <form onsubmit="changePw(event)">
              <div class="form-field"><label class="form-lbl">Текущий пароль</label><input class="form-input" type="password" name="currentPassword" required></div>
              <div class="form-field"><label class="form-lbl">Новый пароль</label><input class="form-input" type="password" name="newPassword" required minlength="6" placeholder="Минимум 6 символов"></div>
              <button type="submit" class="btn btn-outline btn-sm">Изменить пароль</button>
            </form>
          </div>
        </div>
      </div>
    </div>`;

  setTimeout(() => initAdminMapPicker(s.mapLat || 42.8736, s.mapLon || 74.5907), 60);
}

function initAdminMapPicker(lat, lon) {
  if (typeof L === 'undefined') return;
  const el = document.getElementById('adminMapPicker');
  if (!el) return;
  if (window._adminMap) { try { window._adminMap.remove(); } catch(e){} window._adminMap = null; }
  const map = L.map('adminMapPicker').setView([lat, lon], 15);
  window._adminMap = map;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  window._adminMapMarker = L.marker([lat, lon], { draggable: true }).addTo(map);
  function setCoords(ll) {
    const latI = document.getElementById('adminMapLat');
    const lonI = document.getElementById('adminMapLon');
    if (latI) latI.value = ll.lat.toFixed(6);
    if (lonI) lonI.value = ll.lng.toFixed(6);
  }
  window._adminMapMarker.on('dragend', e => setCoords(e.target.getLatLng()));
  map.on('click', e => { window._adminMapMarker.setLatLng(e.latlng); setCoords(e.latlng); });
}

function adminMapUpdate() {
  if (!window._adminMapMarker) return;
  const lat = parseFloat(document.getElementById('adminMapLat')?.value);
  const lon = parseFloat(document.getElementById('adminMapLon')?.value);
  if (isNaN(lat) || isNaN(lon)) return;
  window._adminMapMarker.setLatLng([lat, lon]);
  window._adminMap?.setView([lat, lon], 15);
}

/* ── Homepage editor ── */
async function renderHomePage() {
  const c = document.getElementById('content');
  c.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';
  let s, slidesData;
  try {
    [s, slidesData] = await Promise.all([
      api('/api/settings'),
      api('/api/slides?limit=50').catch(() => ({data: []}))
    ]);
  } catch { toast('Ошибка загрузки','e'); return; }
  const slides = (slidesData.data || []).sort((a,b) => (a.order||0) - (b.order||0));

  var slideCardsHtml = '';
  if (slides.length) {
    slideCardsHtml = slides.map(function(sl) {
      var img = sl.image ? '<img src="' + escapeHtml(sl.image) + '" style="width:100%;height:80px;object-fit:cover;border-radius:6px" loading="lazy">' : '<div style="width:100%;height:80px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:.75rem">Нет фото</div>';
      return '<div style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--border);border-radius:8px;background:#fff">'
        + '<div style="width:120px;flex-shrink:0">' + img + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-weight:600;font-size:.85rem;margin-bottom:2px">' + escapeHtml(sl.titleRu || 'Без названия') + '</div>'
        + '<div style="font-size:.75rem;color:var(--t2)">Порядок: ' + (sl.order || 0) + ' · ' + (sl.active === true || sl.active === 'true' || sl.active === '1' ? 'Активен' : 'Скрыт') + '</div>'
        + '</div>'
        + '<button class="btn btn-icon-danger" style="background:#fee2e2" onclick="deleteHomeSlide(\'' + sl.id + '\')" title="Удалить">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>'
        + '</button>'
        + '</div>';
    }).join('');
  } else {
    slideCardsHtml = '<div style="text-align:center;padding:24px;color:var(--t2)"><p>Пока нет слайдов. Добавьте первый ниже.</p></div>';
  }

  c.innerHTML = `
    <div class="page-head"><div class="page-head-txt"><h2>Главная страница</h2><p>Баннер, обратный отсчёт и статистика</p></div></div>
    <div class="settings-grid">

      <!-- Баннер главной -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="settings-card-head"><h3>🖼 Баннер на главной</h3><p>Фото и текст на главном экране</p></div>
        <div class="settings-card-body">
          <div id="home-slides-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${slideCardsHtml}</div>
          <form onsubmit="addHomeSlide(event)" style="border-top:1px solid var(--border);padding-top:14px">
            <p style="font-size:.8rem;font-weight:600;margin-bottom:10px;color:var(--t2)">Добавить слайд</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="form-field"><label class="form-lbl">Заголовок (RU)</label><input class="form-input" name="slideTitleRu" required placeholder="Заголовок слайда"></div>
              <div class="form-field"><label class="form-lbl">Аталышы (KY)</label><input class="form-input" name="slideTitleKy" placeholder="Слайддын аталышы"></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-lbl">Подзаголовок (RU)</label><textarea class="form-input" name="slideSubtitleRu" rows="2" placeholder="Краткое описание"></textarea></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-lbl">Кыскача (KY)</label><textarea class="form-input" name="slideSubtitleKy" rows="2" placeholder="Кыскача маалымат"></textarea></div>
              <div class="form-field"><label class="form-lbl">URL фото</label><input class="form-input" name="slideImage" required placeholder="https://..."></div>
              <div class="form-field"><label class="form-lbl">Порядок</label><input class="form-input" type="number" name="slideOrder" value="1"></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-field" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" name="slideActive" checked> <span>Активен — показывается на сайте</span></label></div>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:10px">Добавить слайд</button>
          </form>
        </div>
      </div>

      <!-- Обратный отсчёт -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="settings-card-head"><h3>⏳ Обратный отсчёт</h3><p>Заголовок, дата, время и место мероприятия</p></div>
        <div class="settings-card-body">
          <form id="settings-form" onsubmit="saveHomePage(event)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-field"><label class="form-lbl">Название (RU)</label><input class="form-input" name="countdownTitleRu" value="${escapeHtml(s.countdownTitleRu||'')}" placeholder="VI Всемирные игры кочевников"></div>
              <div class="form-field"><label class="form-lbl">Аталышы (KY)</label><input class="form-input" name="countdownTitleKy" value="${escapeHtml(s.countdownTitleKy||'')}" placeholder="VI Дүйнөлүк көчмөндөр оюндары"></div>
              <div class="form-field"><label class="form-lbl">Место (RU)</label><input class="form-input" name="countdownLocationRu" value="${escapeHtml(s.countdownLocationRu||'')}" placeholder="Чолпон-Ата, Иссык-Куль"></div>
              <div class="form-field"><label class="form-lbl">Место (KY)</label><input class="form-input" name="countdownLocationKy" value="${escapeHtml(s.countdownLocationKy||'')}" placeholder="Чолпон-Ата, Ысык-Көл"></div>
              <div class="form-field"><label class="form-lbl">Дата начала</label><input class="form-input" type="date" name="countdownDate" value="${escapeHtml(s.countdownDate||'')}"></div>
              <div class="form-field"><label class="form-lbl">Время начала</label><input class="form-input" type="time" name="countdownTime" value="${escapeHtml(s.countdownTime||'09:00')}"></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-lbl">Описание (RU)</label><textarea class="form-input" name="countdownDescRu" rows="2" placeholder="Краткое описание мероприятия">${escapeHtml(s.countdownDescRu||'')}</textarea></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-lbl">Сүрөттөмө (KY)</label><textarea class="form-input" name="countdownDescKy" rows="2" placeholder="Иш-чаранын кыскача сүрөттөмөсү">${escapeHtml(s.countdownDescKy||'')}</textarea></div>
              <div class="form-field" style="grid-column:1/-1"><label class="form-lbl">Мероприятие (кнопка «Подробнее»)</label><select class="form-input" name="countdownEventId" id="cdEventSelect"><option value="">— Не привязывать —</option></select></div>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:8px">Сохранить</button>
          </form>
        </div>
      </div>

      <!-- Статистика -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="settings-card-head"><h3>📊 Статистика</h3><p>Цифры в блоке «18 видов спорта, 7 областей...»</p></div>
        <div class="settings-card-body">
          <form onsubmit="saveHomePage(event)">
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;align-items:end">
              ${[1,2,3,4].map(i => `
              <div>
                <div class="form-field"><label class="form-lbl">Цифра ${i}</label><input class="form-input" name="stat${i}Value" value="${escapeHtml(s['stat'+i+'Value']||'')}" placeholder="18" style="font-size:1.2rem;font-weight:700;text-align:center"></div>
                <div class="form-field"><label class="form-lbl">Подпись (RU)</label><input class="form-input" name="stat${i}LabelRu" value="${escapeHtml(s['stat'+i+'LabelRu']||'')}"></div>
                <div class="form-field"><label class="form-lbl">Подпись (KY)</label><input class="form-input" name="stat${i}LabelKy" value="${escapeHtml(s['stat'+i+'LabelKy']||'')}"></div>
              </div>`).join('')}
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:8px">Сохранить</button>
          </form>
        </div>
      </div>

    </div>`;

  var sel = document.getElementById('cdEventSelect');
  if (sel) {
    api('/api/events?status=published&limit=200').then(function(j) {
      var events = j.data || [];
      var lang = localStorage.getItem('site-lang') || 'ru';
      events.forEach(function(ev) {
        var opt = document.createElement('option');
        opt.value = ev.id;
        var title = lang === 'ky' ? (ev.titleKy || ev.titleRu || '') : (ev.titleRu || ev.titleKy || '');
        var date  = ev.date ? (' (' + ev.date.slice(0,10) + ')') : '';
        opt.textContent = title + date;
        if (ev.id === s.countdownEventId) opt.selected = true;
        sel.appendChild(opt);
      });
    }).catch(function() {});
  }
}

async function addHomeSlide(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  try {
    await apiFd('/api/slides', 'POST', fd);
    toast('Слайд добавлен');
    renderHomePage();
  } catch { toast('Ошибка добавления слайда', 'e'); }
}

async function deleteHomeSlide(id) {
  if (!confirm('Удалить этот слайд?')) return;
  try {
    await api('/api/slides/' + id, 'DELETE');
    toast('Слайд удалён');
    renderHomePage();
  } catch { toast('Ошибка удаления', 'e'); }
}

async function saveHomePage(e) {
  e.preventDefault();
  try {
    await api('/api/settings', 'PUT', Object.fromEntries(new FormData(e.target).entries()));
    toast('Сохранено — изменения сразу видны на сайте');
    renderHomePage();
  } catch { toast('Ошибка сохранения', 'e'); }
}

/* ── Help / Instructions ── */
function renderHelp() {
  const c = document.getElementById('content');
  const sections = [
    {
      icon: '🏠',
      title: 'Главная страница',
      nav: 'homepage',
      color: '#3b5fc0',
      steps: [
        '<strong>Обратный отсчёт</strong> — введите название мероприятия на русском и кыргызском, укажите место, дату и время начала. Нажмите <em>Сохранить</em>. Таймер на сайте обновится сразу.',
        'В поле <strong>«Мероприятие»</strong> можно выбрать из списка — тогда кнопка «Подробнее» будет вести на страницу этого мероприятия.',
        '<strong>Статистика</strong> — четыре блока с цифрами («18 Видов спорта», «7 Областей» и т.д.). Измените цифру и подпись, нажмите <em>Сохранить</em>.',
      ]
    },
    {
      icon: '📰',
      title: 'Новости',
      nav: 'news',
      color: '#8B2500',
      steps: [
        'Нажмите <strong>«Добавить»</strong> в правом верхнем углу — откроется панель справа.',
        'Заполните заголовок и текст новости на <strong>русском</strong>, затем переключитесь на вкладку <strong>Кыргызча</strong> и введите перевод.',
        'Выберите <strong>категорию</strong>: Новость, Анонс или Результат.',
        'Загрузите <strong>фото обложки</strong> — перетащите файл или нажмите «Добавить фото». Можно обрезать.',
        'Переключите статус на <strong>«Опубликовано»</strong>, чтобы новость появилась на сайте. <em>Черновик</em> — скрыт от посетителей.',
        'Нажмите <strong>«Добавить запись»</strong> — новость сохранена.',
        'Для редактирования нажмите иконку <strong>карандаша</strong> рядом с новостью. Для удаления — иконку <strong>корзины</strong>.',
      ]
    },
    {
      icon: '📅',
      title: 'Мероприятия',
      nav: 'events',
      color: '#C8963E',
      steps: [
        'Нажмите <strong>«Добавить»</strong> и заполните название на двух языках.',
        'Укажите <strong>дату проведения</strong> и <strong>место</strong> (город, адрес).',
        'Добавьте описание — на вкладке RU и KY.',
        'Загрузите <strong>фото мероприятия</strong>.',
        'Опубликуйте — мероприятие появится в разделе «Мероприятия» на сайте и в выпадающем списке обратного отсчёта.',
      ]
    },
    {
      icon: '🖼',
      title: 'Галерея',
      nav: 'gallery',
      color: '#2D6B18',
      steps: [
        'Нажмите <strong>«Загрузить фото»</strong>.',
        'Добавьте подпись к фото на русском и кыргызском.',
        'Выберите <strong>категорию</strong>: Борьба, Стрельба из лука, Конные игры, Праздники или Спортсмены.',
        'Загрузите изображение. После кадрирования нажмите <em>Применить обрезку</em>, затем <em>Добавить запись</em>.',
      ]
    },
    {
      icon: '👤',
      title: 'Спортсмены',
      nav: 'people',
      color: '#1a56a0',
      steps: [
        'Нажмите <strong>«Добавить»</strong> и заполните ФИО на двух языках.',
        'Выберите <strong>роль</strong>: Спортсмен, Тренер или Сотрудник.',
        'Укажите вид спорта, должность, статус карьеры.',
        'Введите краткую <strong>биографию</strong> и <strong>достижения</strong> (каждое с новой строки).',
        'Загрузите <strong>фото</strong> (портрет, формат 3:4).',
        'При желании добавьте ссылки на <strong>Instagram, Telegram, YouTube, Facebook</strong> — иконки появятся на карточке спортсмена.',
      ]
    },
    {
      icon: '🎞',
      title: 'Слайдер',
      nav: 'slides',
      color: '#5b21b6',
      steps: [
        'Управляет фотографиями на главном баннере сайта.',
        'Нажмите <strong>«Добавить»</strong>, введите заголовок и подзаголовок.',
        'Укажите <strong>порядок</strong> показа (1 — первый).',
        'Загрузите фото <strong>16:9</strong> или вставьте URL.',
        'Переключите на <strong>«Активен»</strong>, чтобы слайд показывался. Скрытые слайды не видны на сайте.',
      ]
    },
    {
      icon: '🏅',
      title: 'Виды спорта',
      nav: 'sports',
      color: '#0f766e',
      steps: [
        'Добавьте вид спорта с названием на двух языках.',
        'Укажите <strong>описание</strong> и количество спортсменов.',
        'Загрузите <strong>фотографию</strong> и отдельно <strong>иконку</strong> (небольшой значок для карточки).',
        'Поле <strong>«Порядок»</strong> определяет, в каком порядке виды спорта отображаются на сайте (1 — первый).',
        'Опубликуйте, чтобы вид спорта стал виден посетителям.',
      ]
    },
    {
      icon: '📡',
      title: 'Прямые эфиры',
      nav: 'livestreams',
      color: '#dc2626',
      steps: [
        'Нажмите <strong>«Добавить»</strong> и заполните название трансляции на двух языках.',
        'Вставьте <strong>ссылку на трансляцию</strong> — YouTube или Vimeo.',
        'Выберите <strong>платформу</strong> (YouTube или Vimeo) — от этого зависит, как видео будет встроено.',
        'Укажите <strong>статус</strong>: «В эфире» — трансляция идёт сейчас, «Запланирован» — анонс на сайте, «Завершён» — архив.',
        'Укажите <strong>дату и время</strong> начала эфира (для запланированных).',
        'Загрузите <strong>обложку</strong> эфира (формат 16:9).',
        'Активный эфир (статус «В эфире») отображается на главной странице сайта.',
      ]
    },
    {
      icon: '✉️',
      title: 'Обращения',
      nav: 'contacts',
      color: '#c53030',
      steps: [
        'Здесь хранятся все сообщения, отправленные через форму обратной связи на сайте.',
        '<strong>Красная точка</strong> — непрочитанное. Нажмите галочку, чтобы отметить как прочитанное.',
        'Щёлкните по email-адресу, чтобы ответить письмом.',
        'Удалите ненужные обращения кнопкой с иконкой корзины.',
      ]
    },
    {
      icon: '⚙️',
      title: 'Настройки',
      nav: 'settings',
      color: '#374151',
      steps: [
        '<strong>Логотип</strong> — выберите файл PNG/JPG и нажмите «Загрузить». Логотип появится в шапке и футере сайта.',
        '<strong>Контакты</strong> — email, телефон, адрес организации и <strong>координаты офиса</strong> (широта и долгота). Карта на странице «Контакты» обновится автоматически. При переезде просто измените адрес и координаты.',
        '<strong>Социальные сети</strong> — ссылки на Telegram, Instagram, YouTube, ВКонтакте. Иконки в подвале сайта.',
        '<strong>Безопасность</strong> — смена пароля администратора. Введите текущий пароль, затем новый (минимум 6 символов).',
      ]
    },
  ];

  const cards = sections.map(sec => `
    <div class="help-card">
      <div class="help-card-head" style="border-left:4px solid ${sec.color}">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:1.4rem">${sec.icon}</span>
          <h3 style="margin:0;font-size:1rem;font-weight:700">${sec.title}</h3>
        </div>
        <button class="btn btn-outline btn-sm" onclick="location.hash='${sec.nav}';navigate('${sec.nav}')">Перейти →</button>
      </div>
      <ol class="help-steps">
        ${sec.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>`).join('');

  c.innerHTML = `
    <div class="page-head">
      <div class="page-head-txt">
        <h2>Инструкция по работе с сайтом</h2>
        <p>Как редактировать каждый раздел — пошаговые подсказки</p>
      </div>
    </div>
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:.875rem;color:#78350f">
      💡 <strong>Совет:</strong> все изменения сохраняются кнопкой <em>«Сохранить»</em> и сразу отображаются на сайте. Черновики скрыты от посетителей — это безопасный способ подготовить материал заранее.
    </div>
    <div class="help-grid">${cards}</div>`;
}

/* ── О нас ── */
async function renderAbout() {
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="page-head"><div class="page-head-txt">
      <h2>О нас — страница «О Дирекции»</h2>
      <p>Редактирование истории, ценностей и ключевых дат</p>
    </div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:12px;align-items:center">
      <button class="btn abt-tab" onclick="showAboutTab('history',this)">📝 История</button>
      <button class="btn btn-outline abt-tab" onclick="showAboutTab('values',this)">⭐ Ценности</button>
      <button class="btn btn-outline abt-tab" onclick="showAboutTab('timeline',this)">📅 Ключевые даты</button>
      <span style="margin-left:auto;font-size:.8rem;color:var(--t2)">Раздел «Руководство» → <a href="#people" onclick="navigate('people')">Спортсмены / роль Сотрудник</a></span>
    </div>
    <div id="abt-history"></div>
    <div id="abt-values" style="display:none"></div>
    <div id="abt-timeline" style="display:none"></div>`;
  loadAboutHistory();
  loadAboutList('about-values','abt-values');
  loadAboutList('about-timeline','abt-timeline');
}

function showAboutTab(tab, btn) {
  document.getElementById('abt-history').style.display = tab==='history' ? '' : 'none';
  document.getElementById('abt-values').style.display  = tab==='values'  ? '' : 'none';
  document.getElementById('abt-timeline').style.display= tab==='timeline'? '' : 'none';
  document.querySelectorAll('.abt-tab').forEach(function(b) {
    b.classList.toggle('btn-outline', b !== btn);
  });
}

async function loadAboutHistory() {
  const div = document.getElementById('abt-history');
  try {
    const h = await api('/api/about/history');
    const imgPreview = h.historyImageUrl
      ? `<img src="${escapeHtml(h.historyImageUrl)}" style="display:block;width:220px;height:148px;object-fit:cover;border-radius:8px;margin-bottom:10px;border:1px solid #e2e8f0">`
      : `<div style="width:220px;height:148px;border:2px dashed #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;margin-bottom:10px;font-size:.8rem">Фото не добавлено</div>`;
    const delBtn = h.historyImageUrl
      ? `<button type="button" class="btn btn-outline" style="color:#dc2626;margin-left:8px" onclick="clearHistoryImage()">✕ Удалить</button>` : '';
    div.innerHTML = `
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:.875rem">
        ℹ️ Фото и три абзаца об истории Дирекции, которые отображаются в разделе «О нас» на сайте
      </div>
      <div class="form-field" style="margin-bottom:20px">
        <label class="form-lbl">Фото раздела «История»</label>
        ${imgPreview}
        <div style="display:flex;align-items:center">
          <input type="file" id="hist-img-input" accept="image/*" style="display:none" onchange="uploadHistoryImage(this)">
          <button type="button" class="btn btn-outline" onclick="document.getElementById('hist-img-input').click()">📷 ${h.historyImageUrl ? 'Заменить фото' : 'Загрузить фото'}</button>
          ${delBtn}
        </div>
      </div>
      <form onsubmit="saveAboutHistory(event)">
        <div class="lang-tabs">
          <button type="button" class="lang-tab active" onclick="abtHistLang('ru',this)">🇷🇺 Русский</button>
          <button type="button" class="lang-tab" onclick="abtHistLang('ky',this)">🇰🇬 Кыргызча</button>
        </div>
        <div class="abt-hp" data-al="ru">
          <div class="form-field"><label class="form-lbl">Абзац 1 (RU)</label><textarea class="form-input" name="historyPara1Ru" rows="4">${escapeHtml(h.historyPara1Ru||'')}</textarea></div>
          <div class="form-field"><label class="form-lbl">Абзац 2 (RU)</label><textarea class="form-input" name="historyPara2Ru" rows="4">${escapeHtml(h.historyPara2Ru||'')}</textarea></div>
          <div class="form-field"><label class="form-lbl">Абзац 3 (RU)</label><textarea class="form-input" name="historyPara3Ru" rows="4">${escapeHtml(h.historyPara3Ru||'')}</textarea></div>
        </div>
        <div class="abt-hp" data-al="ky" style="display:none">
          <div class="form-field"><label class="form-lbl">Абзац 1 (KY)</label><textarea class="form-input" name="historyPara1Ky" rows="4">${escapeHtml(h.historyPara1Ky||'')}</textarea></div>
          <div class="form-field"><label class="form-lbl">Абзац 2 (KY)</label><textarea class="form-input" name="historyPara2Ky" rows="4">${escapeHtml(h.historyPara2Ky||'')}</textarea></div>
          <div class="form-field"><label class="form-lbl">Абзац 3 (KY)</label><textarea class="form-input" name="historyPara3Ky" rows="4">${escapeHtml(h.historyPara3Ky||'')}</textarea></div>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top:8px">💾 Сохранить историю</button>
      </form>`;
  } catch { div.innerHTML = '<p style="color:red">Ошибка загрузки</p>'; }
}

function abtHistLang(lang, btn) {
  document.querySelectorAll('.abt-hp').forEach(function(p){ p.style.display = p.dataset.al===lang ? '' : 'none'; });
  btn.closest('.lang-tabs').querySelectorAll('.lang-tab').forEach(function(b){ b.classList.toggle('active', b===btn); });
}

async function saveAboutHistory(e) {
  e.preventDefault();
  try {
    await api('/api/about/history','PUT',Object.fromEntries(new FormData(e.target).entries()));
    toast('История сохранена — изменения сразу видны на сайте');
  } catch { toast('Ошибка сохранения','e'); }
}

async function uploadHistoryImage(input) {
  if (!input || !input.files[0]) return;
  const fd = new FormData();
  fd.append('image', input.files[0]);
  try {
    await apiFd('/api/about/image', 'POST', fd);
    toast('Фото сохранено');
    loadAboutHistory();
  } catch(ex) { toast(ex.message || 'Ошибка загрузки', 'e'); }
}

async function clearHistoryImage() {
  try {
    await api('/api/about/history', 'PUT', { historyImageUrl: '' });
    toast('Фото удалено');
    loadAboutHistory();
  } catch { toast('Ошибка', 'e'); }
}

/* ── Gallery Manager (sports photos + timeline photos) ── */
let _gmType = '', _gmId = '', _gmName = '';

async function openGalleryManager(type, id, name) {
  _gmType = type; _gmId = id; _gmName = name;
  const apiPath = type === 'sports' ? `/api/sports/${encodeURIComponent(id)}` : `/api/about/timeline/${encodeURIComponent(id)}`;
  const addPath = type === 'sports' ? `/api/sports/${encodeURIComponent(id)}/add-photo` : `/api/about/timeline/${encodeURIComponent(id)}/add-photo`;
  const delPath = type === 'sports' ? `/api/sports/${encodeURIComponent(id)}/remove-photo` : `/api/about/timeline/${encodeURIComponent(id)}/remove-photo`;

  const modal = document.getElementById('galleryManagerModal');
  const body  = document.getElementById('galleryManagerBody');
  const title = document.getElementById('galleryManagerTitle');
  if (!modal) return;
  title.textContent = '📸 Фото галерея — ' + name;
  body.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div></div>';
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  async function refresh() {
    try {
      const item = await api(apiPath);
      const photos = Array.isArray(item.photos) ? item.photos.filter(Boolean) : [];
      body.innerHTML = `
        <div style="margin-bottom:14px">
          <label class="form-lbl">Добавить фото</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input type="file" id="gm-file" accept="image/*" style="flex:1;min-width:0">
            <button class="btn btn-primary" onclick="gmUpload()">Загрузить</button>
          </div>
        </div>
        ${photos.length ? `<div class="gm-grid">${photos.map((p,i)=>`
          <div class="gm-photo" style="position:relative">
            <img src="${escapeHtml(p)}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:8px;display:block">
            <button class="gm-del" onclick="gmDelete(${JSON.stringify(p)})" title="Удалить" style="position:absolute;top:4px;right:4px;background:rgba(220,38,38,.85);color:#fff;border:none;border-radius:4px;padding:3px 7px;cursor:pointer;font-size:.8rem">✕</button>
          </div>`).join('')}</div>`
          : '<p style="text-align:center;opacity:.5;padding:20px 0">Фото не добавлены</p>'}`;
    } catch { body.innerHTML = '<p style="color:red">Ошибка загрузки</p>'; }
  }

  window.gmUpload = async function() {
    const f = document.getElementById('gm-file');
    if (!f || !f.files[0]) { toast('Выберите файл', 'i'); return; }
    const fd = new FormData(); fd.append('photo', f.files[0]);
    try { await apiFd(addPath, 'POST', fd); toast('Фото добавлено'); refresh(); } catch(ex) { toast(ex.message||'Ошибка','e'); }
  };
  window.gmDelete = async function(url) {
    if (!confirm('Удалить фото?')) return;
    try { await api(delPath, 'DELETE', {url}); toast('Фото удалено'); refresh(); } catch { toast('Ошибка','e'); }
  };

  refresh();
}

function closeGalleryManager() {
  document.getElementById('galleryManagerModal').classList.add('hidden');
  document.body.style.overflow = '';
}

async function loadAboutList(section, targetId) {
  const cfg = CFG[section];
  const div = document.getElementById(targetId);
  if (!div) return;
  const isTl = section === 'about-timeline';
  try {
    const data = await api(cfg.api+'?limit=100');
    const items = (data.data||[]);
    div.innerHTML = `<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary" onclick="openDrawer('${section}',null)">+ Добавить</button></div>`
      + (!items.length ? '<p style="text-align:center;opacity:.5;padding:40px">Ничего нет — нажмите «Добавить»</p>'
        : '<div class="table-wrap"><table class="data-table"><tbody>'
          + items.map(function(it){
            var icon = (isTl ? `<button class="icon-btn" onclick="openGalleryManager('timeline',${JSON.stringify(it.id)},${JSON.stringify(it.titleRu||it.year||'')})" title="Фото" style="color:var(--primary)">📸</button>` : '')
                      + `<button class="icon-btn" onclick="openDrawer('${section}','${it.id}')" title="Редактировать"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`
                      + `<button class="icon-btn danger" onclick="confirmDel('${section}','${it.id}')" title="Удалить"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>`;
            return '<tr>'+(isTl?`<td style="font-weight:700;width:60px">${escapeHtml(it.year||'')}</td>`:'')
              +`<td><strong>${escapeHtml(it.titleRu||'')}</strong></td>`
              +`<td style="color:var(--t2);max-width:280px">${escapeHtml(((isTl?it.descRu:it.textRu)||'').slice(0,80))}…</td>`
              +`<td style="white-space:nowrap">${icon}</td></tr>`;
          }).join('')
          + '</tbody></table></div>');
  } catch { div.innerHTML = '<p style="color:red">Ошибка загрузки</p>'; }
}

function previewLogo(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('logo-preview-img');
    if (img) { img.style.display = 'block'; img.src = e.target.result; }
  };
  reader.readAsDataURL(file);
}

async function uploadLogo() {
  const input = document.getElementById('logo-file-input');
  if (!input || !input.files[0]) { toast('Выберите файл изображения', 'i'); return; }
  const fd = new FormData();
  fd.append('logo', input.files[0]);
  try {
    const r = await apiFd('/api/settings/logo', 'POST', fd);
    toast('Логотип обновлён — обновите страницу чтобы увидеть изменения');
    const img = document.getElementById('logo-preview-img');
    if (img) img.src = (r.path || '/logo.png') + '?t=' + Date.now();
    input.value = '';
  } catch(ex) { toast(ex.message || 'Ошибка загрузки', 'e'); }
}

async function saveSettings(e) {
  e.preventDefault();
  try {
    await api('/api/settings', 'PUT', Object.fromEntries(new FormData(e.target).entries()));
    toast('Настройки сохранены — изменения сразу видны на сайте');
    renderSettings();
  } catch { toast('Ошибка сохранения', 'e'); }
}

async function changePw(e) {
  e.preventDefault();
  try {
    await api('/api/auth/change-password','POST',Object.fromEntries(new FormData(e.target).entries()));
    toast('Пароль изменён'); e.target.reset();
  } catch(ex) { toast(ex.message||'Ошибка','e'); }
}

/* ── Sidebar / mobile ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('active');
}

/* ── Toast ── */
function toast(msg, type='s') {
  const icons = {s:'✓',e:'✕',i:'ℹ'};
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = document.createElement('span');
  icon.textContent = icons[type] || 'ℹ';
  el.appendChild(icon);
  el.appendChild(document.createTextNode(' ' + String(msg)));
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.style.transition='.3s'; el.style.opacity='0'; el.style.transform='translateY(4px)'; setTimeout(()=>el.remove(),300); }, 2800);
}

/* ── Sport icon upload helper ── */
async function uploadSportIcon(fieldKey, input) {
  if (!input || !input.files[0]) return;
  const fd = new FormData();
  fd.append('icon', input.files[0]);
  try {
    const r = await apiFd('/api/sports/upload-icon', 'POST', fd);
    const valEl     = document.getElementById(`iconVal-${fieldKey}`);
    const previewEl = document.getElementById(`icon-preview-${fieldKey}`);
    if (valEl) valEl.value = r.url;
    if (previewEl) previewEl.innerHTML = `<img src="${escapeHtml(r.url)}" style="max-width:56px;max-height:56px;object-fit:contain;display:block">`;
    input.value = '';
    toast('Иконка загружена — нажмите «Сохранить» для применения', 'i');
  } catch (ex) {
    toast(ex.message || 'Ошибка загрузки иконки', 'e');
  }
}

/* ── API ── */
async function api(url, method='GET', body=null) {
  const h = {'Content-Type':'application/json'};
  if (token) h['Authorization'] = `Bearer ${token}`;
  const opts = {method, headers:h};
  if (body && method!=='GET') opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 401 && !url.includes('/login')) {
    toast('Сессия истекла. Перенаправление...', 'i');
    setTimeout(() => { token = null; localStorage.removeItem('adminToken'); showLogin(); }, 1800);
    throw new Error('Сессия истекла');
  }
  const d = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(d.error||`HTTP ${res.status}`);
  return d;
}

async function apiFd(url, method, fd) {
  const h = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {method, headers:h, body:fd});
  const d = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(d.error||`HTTP ${res.status}`);
  return d;
}

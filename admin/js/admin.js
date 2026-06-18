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
      {key:'image',label:'Обложка',type:'upload'}
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
      {key:'photo',label:'Фотография',type:'upload'}
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
      {key:'descriptionRu', label:'Описание', lang:'ru', type:'textarea', ph:'Описание вида спорта...'},
      {key:'descriptionKy', label:'Сүрөттөмө', lang:'ky', type:'textarea', ph:'Спорт түрүнүн сүрөттөмөсү...'},
      {key:'athletesCount', label:'Число спортсменов', type:'number', noLang:true},
      {key:'order', label:'Порядок показа (1 = первый)', type:'number', noLang:true},
      {key:'status', label:'Статус', type:'select', noLang:true, opts:[{v:'published',l:'Опубликован — виден на сайте'},{v:'draft',l:'Черновик — скрыт'}]},
      {key:'image', label:'Фотография', type:'upload'}
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
  for (const s of ['news','events','gallery','people','sports','slides']) {
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
  const labels = {dashboard:'Дашборд',news:'Новости',events:'Мероприятия',gallery:'Галерея',people:'Спортсмены',sports:'Виды спорта',slides:'Слайдер',settings:'Настройки',contacts:'Обращения'};
  document.getElementById('topbar-section').textContent = labels[section] || section;
  if (section === 'dashboard') renderDashboard();
  else if (section === 'settings') renderSettings();
  else if (section === 'contacts') renderContacts();
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

  const kpis = [
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,cls:'i-red',val:news.total||0,lbl:'Новостей'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,cls:'i-gold',val:events.total||0,lbl:'Мероприятий'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,cls:'i-green',val:gallery.total||0,lbl:'Фотографий'},
    {icon:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,cls:'i-blue',val:people.total||0,lbl:'Людей'}
  ];

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
    </div>`;
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
  if (col.type === 'img') { const s = item.image||item.photo; return s ? `<img class="td-thumb" src="${escapeHtml(s)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=60'">` : '<div class="td-thumb-ph">📷</div>'; }
  if (col.type === 'name') return `<div class="td-name">${escapeHtml(v||'—')}</div><div class="td-meta">${escapeHtml(item.titleKy||'')}</div>`;
  if (col.type === 'badge') {
    const sv = String(v);
    const l = col.map?.[sv] ?? col.map?.[v] ?? sv ?? '—';
    const clsMap = {published:'b-pub', draft:'b-draft', archived:'b-archived', athlete:'b-athlete', staff:'b-staff', coach:'b-coach', true:'b-pub', false:'b-draft', active:'b-pub', retired:'b-draft'};
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
  const sectionRatios = { news: 16/9, events: 16/9, gallery: 4/3, people: 3/4, slides: 16/9 };
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

  // Status toggle — only for sections that use a 'status' field (not 'active' or no status)
  const hasStatusField = cfg.fields.some(f => f.key === 'status') ||
    (cfg.cols && cfg.cols.some(c => c.key === 'status'));
  const usesActiveField = cfg.fields.some(f => f.key === 'active');
  if (hasStatusField && !usesActiveField) {
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
  if (f.type === 'number') return `<div class="form-field"><label class="form-lbl">${f.label}</label><input type="number" class="form-input" name="${f.key}" value="${escapeHtml(v)}" min="1"></div>`;
  if (f.type === 'upload') {
    const existingImages = item
      ? [item.image, ...(item.images || [])].filter(Boolean)
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
  try {
    await apiFd(url, method, fd);
    closeDrawer();
    toast(drawerItemId ? 'Изменения сохранены' : 'Запись добавлена');
    renderSection(drawerSection);
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
    renderSection(section); loadBadges();
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

  c.innerHTML = `
    <div class="page-head"><div class="page-head-txt"><h2>Настройки</h2><p>Контактная информация и данные сайта</p></div></div>
    <div class="settings-grid">
      <div class="settings-card">
        <div class="settings-card-head"><h3>Контактная информация</h3><p>Адрес, телефон и почта</p></div>
        <div class="settings-card-body">
          <form onsubmit="saveSettings(event)">
            <div class="form-field"><label class="form-lbl">Email</label><input class="form-input" name="email" value="${escapeHtml(s.email||'')}" type="email"></div>
            <div class="form-field"><label class="form-lbl">Телефон</label><input class="form-input" name="phone" value="${escapeHtml(s.phone||'')}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (RU)</label><input class="form-input" name="addressRu" value="${escapeHtml(s.address?.ru||'')}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (KY)</label><input class="form-input" name="addressKy" value="${escapeHtml(s.address?.ky||'')}"></div>
            <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
          </form>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="settings-card">
          <div class="settings-card-head"><h3>Социальные сети</h3></div>
          <div class="settings-card-body">
            <form onsubmit="saveSettings(event)">
              <div class="form-field"><label class="form-lbl">ВКонтакте</label><input class="form-input" name="socialVk" value="${escapeHtml(s.socialVk||'')}" placeholder="https://vk.com/..."></div>
              <div class="form-field"><label class="form-lbl">Telegram</label><input class="form-input" name="socialTelegram" value="${escapeHtml(s.socialTelegram||'')}" placeholder="@channel"></div>
              <div class="form-field"><label class="form-lbl">Instagram</label><input class="form-input" name="socialInstagram" value="${escapeHtml(s.socialInstagram||'')}" placeholder="@account"></div>
              <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
            </form>
          </div>
        </div>
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
}

async function saveSettings(e) {
  e.preventDefault();
  try {
    await api('/api/settings','PUT',Object.fromEntries(new FormData(e.target).entries()));
    toast('Настройки сохранены');
  } catch { toast('Ошибка сохранения','e'); }
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

/* ── API ── */
async function api(url, method='GET', body=null) {
  const h = {'Content-Type':'application/json'};
  if (token) h['Authorization'] = `Bearer ${token}`;
  const opts = {method, headers:h};
  if (body && method!=='GET') opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 401) {
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

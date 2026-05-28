/* ── State ── */
let token = localStorage.getItem('adminToken');
let currentUser = null;
let currentPage = {};
let currentFilter = {};
let currentSearch = {};
let drawerSection = null;
let drawerItemId = null;
let searchTimers = {};

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
    filterKey:'status', filterOpts:[{v:'',l:'Все статусы'},{v:'published',l:'Опубликовано'},{v:'draft',l:'Черновик'}],
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
    title:'Люди', hint:'Спортсмены, тренеры и сотрудники', api:'/api/people',
    cols:[
      {key:'photo',label:'Фото',type:'img'},
      {key:'nameRu',label:'Имя',type:'name'},
      {key:'role',label:'Роль',type:'badge',map:{athlete:'Спортсмен',staff:'Сотрудник',coach:'Тренер'}},
      {key:'sportRu',label:'Вид спорта'},
      {key:'titleRu',label:'Должность'}
    ],
    filterKey:'role', filterOpts:[{v:'',l:'Все роли'},{v:'athlete',l:'Спортсмены'},{v:'coach',l:'Тренеры'},{v:'staff',l:'Сотрудники'}],
    fields:[
      {key:'nameRu',label:'Имя',lang:'ru',type:'text',req:true,ph:'ФИО на русском'},
      {key:'nameKy',label:'Аты-жөнү',lang:'ky',type:'text',req:true,ph:'Кыргызча аты-жөнү'},
      {key:'role',label:'Роль',type:'select',noLang:true,opts:[{v:'athlete',l:'Спортсмен'},{v:'coach',l:'Тренер'},{v:'staff',l:'Сотрудник'}]},
      {key:'titleRu',label:'Должность',lang:'ru',type:'text',ph:'Должность или звание'},
      {key:'titleKy',label:'Кызматы',lang:'ky',type:'text',ph:'Кызматы же наамы'},
      {key:'sportRu',label:'Вид спорта',lang:'ru',type:'text',ph:'Дисциплина'},
      {key:'sportKy',label:'Спорт түрү',lang:'ky',type:'text',ph:'Спорт тармагы'},
      {key:'bioRu',label:'Биография',lang:'ru',type:'textarea',ph:'Краткая биография...'},
      {key:'bioKy',label:'Өмүр баяны',lang:'ky',type:'textarea',ph:'Кыскача өмүр баяны...'},
      {key:'achievements',label:'Достижения',type:'textarea',noLang:true,ph:'Медали, титулы, звания...'},
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
      {key:'order', label:'Порядок', type:'number', noLang:true},
      {key:'image', label:'Фото слайда', type:'upload', req:true}
    ]
  },
  sports: {
    title: 'Виды спорта', hint: 'Управление видами спорта', api: '/api/sports',
    cols: [
      {key:'image', label:'Фото', type:'img'},
      {key:'nameRu', label:'Название', type:'name'},
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
}

/* ── Navigation ── */
function navigate(section) {
  document.querySelectorAll('.sb-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
  const labels = {dashboard:'Дашборд',news:'Новости',events:'Мероприятия',gallery:'Галерея',people:'Люди',sports:'Виды спорта',slides:'Слайдер',settings:'Настройки'};
  document.getElementById('topbar-section').textContent = labels[section] || section;
  if (section === 'dashboard') renderDashboard();
  else if (section === 'settings') renderSettings();
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
      ${n.image ? `<img class="dash-item-img" src="${n.image}" loading="lazy">` : '<div class="dash-item-img-ph">📰</div>'}
      <div class="dash-item-txt">
        <div class="dash-item-title">${n.titleRu||'Без заголовка'}</div>
        <div class="dash-item-meta">${n.status==='published'?'✓ Опубликовано':'⬤ Черновик'} · ${n.createdAt?new Date(n.createdAt).toLocaleDateString('ru-RU'):''}</div>
      </div>
    </div>`).join('') || '<div class="empty" style="padding:24px"><p>Нет новостей</p></div>';

  const eventsList = (recentEvents.data||[]).map(n => `
    <div class="dash-item" onclick="location.hash='events';navigate('events')">
      ${n.image ? `<img class="dash-item-img" src="${n.image}" loading="lazy">` : '<div class="dash-item-img-ph">📅</div>'}
      <div class="dash-item-txt">
        <div class="dash-item-title">${n.titleRu||'Без названия'}</div>
        <div class="dash-item-meta">${n.date?new Date(n.date).toLocaleDateString('ru-RU'):''} ${n.location?`· ${n.location}`:''}</div>
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
            <img src="${item.image}" alt="${item.titleRu||''}" loading="lazy">
            <div class="gal-over">
              <button class="btn btn-icon" style="background:rgba(255,255,255,.9)" onclick="openDrawer('${section}','${item.id}')" title="Изменить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-icon-danger" style="background:rgba(255,255,255,.9)" onclick="confirmDel('${section}','${item.id}')" title="Удалить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            <div class="gal-cap">${item.titleRu||''}</div>
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
  if (col.type === 'img') { const s = item.image||item.photo; return s ? `<img class="td-thumb" src="${s}" loading="lazy">` : '<div class="td-thumb-ph">📷</div>'; }
  if (col.type === 'name') return `<div class="td-name">${v||'—'}</div><div class="td-meta">${item.titleKy||''}</div>`;
  if (col.type === 'badge') { const l=col.map?.[v]||v||'—'; const cls={published:'b-pub',draft:'b-draft',athlete:'b-athlete',staff:'b-staff',coach:'b-coach'}[v]||'b-draft'; return `<span class="badge ${cls}">${l}</span>`; }
  if (col.type === 'date') return v ? new Date(v).toLocaleDateString('ru-RU') : '—';
  if (col.map) return col.map[v]||v||'—';
  return v||'—';
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

  // Status toggle
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

  if (uploadField) body += renderField(uploadField, item);
  body += `</form>`;

  document.getElementById('drawer-body').innerHTML = body;
  document.getElementById('drawer-foot').innerHTML = `
    <button class="btn btn-outline" onclick="closeDrawer()">Отмена</button>
    <button class="btn btn-save" onclick="document.getElementById('drawer-form').requestSubmit()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ${id ? 'Сохранить изменения' : 'Добавить запись'}
    </button>`;

  setupUploadZone();
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
  if (f.type === 'textarea') return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label><textarea class="form-input" name="${f.key}" placeholder="${f.ph||''}" rows="4">${v}</textarea></div>`;
  if (f.type === 'select') return `<div class="form-field"><label class="form-lbl">${f.label}</label><select class="form-input form-select" name="${f.key}">${(f.opts||[]).map(o=>`<option value="${o.v}"${v===o.v?' selected':''}>${o.l}</option>`).join('')}</select></div>`;
  if (f.type === 'date') return `<div class="form-field"><label class="form-lbl">${f.label}</label><input type="date" class="form-input" name="${f.key}" value="${v}"></div>`;
  if (f.type === 'number') return `<div class="form-field"><label class="form-lbl">${f.label}</label><input type="number" class="form-input" name="${f.key}" value="${v}" min="1"></div>`;
  if (f.type === 'upload') {
    const src = item ? (item.image||item.photo) : null;
    const urlInput = drawerSection === 'slides' ? `
      <div style="margin-top:12px">
        <label class="form-lbl">Или вставьте URL фотографии</label>
        <input type="text" class="form-input" name="imageUrl"
               placeholder="https://..."
               value="${item?.imageUrl || (src && src.startsWith('http') ? src : '') || ''}"
               oninput="previewFromUrl(this.value)">
      </div>` : '';
    return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label>
      <div class="upload-zone" id="upload-zone">
        <input type="file" name="${f.key}" id="upload-input" accept="image/*">
        <div class="upload-icon">📷</div>
        <div class="upload-text"><strong>Нажмите</strong> или перетащите фото сюда</div>
        <div class="upload-hint">JPG, PNG, WebP · до 5 МБ</div>
        <div class="upload-preview" id="upload-preview" style="${src?'display:block':''}">
          <img src="${src||''}" id="upload-preview-img" alt="Превью">
          <button type="button" class="upload-remove" onclick="removePreview()" title="Удалить">✕</button>
        </div>
      </div>${urlInput}
    </div>`;
  }
  return `<div class="form-field"><label class="form-lbl">${f.label}${req}</label><input type="text" class="form-input" name="${f.key}" value="${v}" placeholder="${f.ph||''}"></div>`;
}

function closeDrawer() {
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

/* ── Upload drag & drop ── */
function setupUploadZone() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('upload-input');
  if (!zone || !input) return;
  ['dragenter','dragover'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(e => zone.addEventListener(e, () => zone.classList.remove('drag-over')));
  zone.addEventListener('drop', ev => { ev.preventDefault(); const f=ev.dataTransfer.files[0]; if(f&&/image/.test(f.type)) showPreview(f); });
  input.addEventListener('change', () => { if(input.files[0]) showPreview(input.files[0]); });
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const wrap = document.getElementById('upload-preview');
    const img = document.getElementById('upload-preview-img');
    if (wrap && img) { img.src = e.target.result; wrap.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function removePreview() {
  const wrap = document.getElementById('upload-preview');
  const input = document.getElementById('upload-input');
  if (wrap) wrap.style.display = 'none';
  if (input) input.value = '';
}

function previewFromUrl(url) {
  if (!url) return;
  const img = document.getElementById('upload-preview-img');
  const wrap = document.getElementById('upload-preview');
  if (img && wrap) { img.src = url; wrap.style.display = 'block'; }
}

/* ── Submit ── */
async function submitDrawer(e) {
  e.preventDefault();
  const cfg = CFG[drawerSection];
  const btn = document.querySelector('#drawer-foot .btn-save');
  btn.disabled=true; btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .7s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Сохранение...';

  const fd = new FormData(e.target);
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
            <div class="form-field"><label class="form-lbl">Email</label><input class="form-input" name="email" value="${s.email||''}" type="email"></div>
            <div class="form-field"><label class="form-lbl">Телефон</label><input class="form-input" name="phone" value="${s.phone||''}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (RU)</label><input class="form-input" name="addressRu" value="${s.address?.ru||''}"></div>
            <div class="form-field"><label class="form-lbl">Адрес (KY)</label><input class="form-input" name="addressKy" value="${s.address?.ky||''}"></div>
            <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
          </form>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="settings-card">
          <div class="settings-card-head"><h3>Социальные сети</h3></div>
          <div class="settings-card-body">
            <form onsubmit="saveSettings(event)">
              <div class="form-field"><label class="form-lbl">ВКонтакте</label><input class="form-input" name="socialVk" value="${s.socialVk||''}" placeholder="https://vk.com/..."></div>
              <div class="form-field"><label class="form-lbl">Telegram</label><input class="form-input" name="socialTelegram" value="${s.socialTelegram||''}" placeholder="@channel"></div>
              <div class="form-field"><label class="form-lbl">Instagram</label><input class="form-input" name="socialInstagram" value="${s.socialInstagram||''}" placeholder="@account"></div>
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
  el.innerHTML = `<span>${icons[type]||'ℹ'}</span> ${msg}`;
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

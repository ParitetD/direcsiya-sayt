/* ==========================================================================
   National Sports Website — Main JavaScript
   ========================================================================== */

/* ── XSS Protection: sanitize HTML before insertion ── */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
}

/* ── Hero Slideshow ── */
var heroSlides   = [];
var currentSlide = 0;
var slideTimer   = null;

async function initHeroSlider() {
    try {
        const r = await fetch('/api/slides');
        const d = await r.json();
        heroSlides = (Array.isArray(d) ? d : (d.data || []))
            .filter(s => s.active !== false && s.active !== 'false')
            .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
    } catch (e) {}

    if (!heroSlides.length) {
        heroSlides = [
            {
                image: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=1600&q=80',
                titleRu: 'Дирекция национальных видов спорта Кыргызстана',
                titleKy: 'Кыргызстандын улуттук спорт түрлөрү боюнча дирекциясы',
                subtitleRu: 'Сохраняем и развиваем национальные спортивные традиции кыргызского народа',
                subtitleKy: 'Кыргыз элинин улуттук спорт салттарын сактап жана өнүктүрөбүз',
                active: true, order: 1
            },
            {
                image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80',
                titleRu: 'Кыргызские спортсмены — гордость нации',
                titleKy: 'Кыргыз спортчулары — элдин сыймыгы',
                subtitleRu: 'Наши атлеты с честью представляют страну на мировых соревнованиях',
                subtitleKy: 'Биздин спортчулар дүйнөлүк мелдештерде өлкөбүздү намыс менен коргойт',
                active: true, order: 2
            },
            {
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
                titleRu: 'Развитие спорта по всему Кыргызстану',
                titleKy: 'Бүткүл Кыргызстанда спортту өнүктүрүү',
                subtitleRu: 'Строим объекты и воспитываем чемпионов в каждом регионе',
                subtitleKy: 'Ар бир аймакта спорт курулуштарын куруп, чемпиондорду тарбиялайбыз',
                active: true, order: 3
            }
        ];
    }

    renderHeroSlides();
    startSlider();
}

function renderHeroSlides() {
    const container = document.getElementById('heroSlides');
    const dotsEl    = document.getElementById('heroDots');
    if (!container || !heroSlides.length) return;

    const lang     = localStorage.getItem('site-lang') || 'ru';
    const btnSport = lang === 'ky' ? 'Спорт түрлөрү' : 'Виды спорта';
    const btnNews  = lang === 'ky' ? 'Жаңылыктар'    : 'Новости';

    container.innerHTML = heroSlides.map((s, i) => `
        <div class="hero-slide${i === currentSlide ? ' active' : ''}"
             style="background-image:url('${escapeHtml(s.image)}')">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <img src="/logo.png" class="hero-logo"
                     onerror="this.style.display='none'" alt="ДНВС">
                <h1 class="hero-title">${escapeHtml(lang === 'ky' ? (s.titleKy || s.titleRu || '') : (s.titleRu || s.titleKy || ''))}</h1>
                <p class="hero-sub">${escapeHtml(lang === 'ky' ? (s.subtitleKy || s.subtitleRu || '') : (s.subtitleRu || s.subtitleKy || ''))}</p>
                <div class="hero-btns">
                    <a href="sports.html" class="btn-hero-primary">${btnSport}</a>
                    <a href="news.html" class="btn-hero-outline">${btnNews}</a>
                </div>
            </div>
        </div>
    `).join('');

    if (dotsEl) {
        dotsEl.innerHTML = heroSlides.map((_, i) =>
            `<span class="hero-dot${i === currentSlide ? ' active' : ''}"
                   onclick="goSlide(${i});startSlider()"></span>`
        ).join('');
    }
}

function goSlide(n) {
    const container = document.getElementById('heroSlides');
    const dotsEl    = document.getElementById('heroDots');
    if (!container) return;
    const allSlides = container.querySelectorAll('.hero-slide');
    const allDots   = dotsEl ? dotsEl.querySelectorAll('.hero-dot') : [];
    if (!allSlides.length) return;

    allSlides[currentSlide]?.classList.remove('active');
    allDots[currentSlide]?.classList.remove('active');

    currentSlide = ((n % heroSlides.length) + heroSlides.length) % heroSlides.length;

    allSlides[currentSlide]?.classList.add('active');
    allDots[currentSlide]?.classList.add('active');
}
window.goSlide = goSlide;

function startSlider() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(() => goSlide(currentSlide + 1), 5000);
}
window.startSlider = startSlider;

initHeroSlider();

/* ── Sports Icons — Kyrgyz national ornamental frame ── */
const _si = (f) =>
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/>` +
  `<path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/>` +
  `<path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/>` +
  f + `</svg>`;
const SPORT_ICONS_BY_ID = {
  '1': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round" stroke-linejoin="round"><circle cx="21" cy="22" r="4.5" fill="#2D6B18" stroke="none"/><path d="M21,26Q24,31 29,37" stroke-width="3"/><path d="M12,30Q21,32 38,37" stroke-width="2.5"/><path d="M29,37L22,53M29,37L37,52" stroke-width="2.5"/><circle cx="59" cy="22" r="4.5" fill="#2D6B18" stroke="none"/><path d="M59,26Q56,31 51,37" stroke-width="3"/><path d="M68,30Q59,32 42,37" stroke-width="2.5"/><path d="M51,37L44,52M51,37L58,53" stroke-width="2.5"/><line x1="38" y1="37" x2="42" y2="37" stroke-width="5" stroke-linecap="round"/></g></svg>`,
  '2': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g stroke="#2D6B18"><rect x="5" y="26" width="70" height="33" rx="8" fill="none" stroke-width="2.5"/><line x1="40" y1="26" x2="40" y2="59" stroke-width="1.8"/><circle cx="13" cy="36" r="3.8" fill="#2D6B18"/><circle cx="22" cy="36" r="3.8" fill="#2D6B18"/><circle cx="31" cy="36" r="3.8" fill="#2D6B18"/><circle cx="13" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="22" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="31" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="49" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="58" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="67" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="49" cy="49" r="3.8" fill="#2D6B18"/><circle cx="58" cy="49" r="3.8" fill="#2D6B18"/><circle cx="67" cy="49" r="3.8" fill="#2D6B18"/></g></svg>`,
  '3': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="37" cy="45" rx="20" ry="9" fill="#2D6B18" stroke="none"/><path d="M57,43L65,33L63,27L57,31Z" fill="#2D6B18" stroke="none"/><path d="M17,45C11,43 7,37 4,29" stroke-width="3.5"/><line x1="49" y1="54" x2="55" y2="62" stroke-width="2.5"/><line x1="43" y1="54" x2="47" y2="62" stroke-width="2.5"/><line x1="29" y1="54" x2="21" y2="62" stroke-width="2.5"/><line x1="23" y1="54" x2="15" y2="62" stroke-width="2.5"/><circle cx="51" cy="28" r="4" fill="#2D6B18" stroke="none"/><path d="M51,32L49,42" stroke-width="2.5"/><path d="M49,37L40,50" stroke-width="2"/><ellipse cx="34" cy="56" rx="5" ry="3" fill="#2D6B18" stroke="none"/></g></svg>`,
  '5': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="38" cy="44" rx="22" ry="10" fill="#2D6B18" stroke="none"/><path d="M60,40L70,28L68,22L62,26L60,34Z" fill="#2D6B18" stroke="none"/><path d="M16,44C8,40 4,34 2,26" stroke-width="3.5"/><line x1="52" y1="54" x2="59" y2="62" stroke-width="2.5"/><line x1="44" y1="54" x2="48" y2="62" stroke-width="2.5"/><line x1="30" y1="54" x2="22" y2="62" stroke-width="2.5"/><line x1="24" y1="54" x2="16" y2="62" stroke-width="2.5"/><circle cx="56" cy="25" r="4" fill="#2D6B18" stroke="none"/><path d="M56,29Q54,36 52,42" stroke-width="2.5"/><path d="M48,32L66,30" stroke-width="2"/></g></svg>`,
  '6': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="21" cy="46" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M35,44L41,36L39,30L34,33Z" fill="#2D6B18" stroke="none"/><path d="M7,46C3,44 1,40 2,34" stroke-width="2.5"/><line x1="27" y1="53" x2="32" y2="62" stroke-width="2"/><line x1="17" y1="53" x2="11" y2="62" stroke-width="2"/><circle cx="31" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M31,30L31,40" stroke-width="2.5"/><path d="M27,35L43,35" stroke-width="2"/><ellipse cx="59" cy="46" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M45,44L39,36L41,30L46,33Z" fill="#2D6B18" stroke="none"/><path d="M73,46C77,44 79,40 78,34" stroke-width="2.5"/><line x1="53" y1="53" x2="48" y2="62" stroke-width="2"/><line x1="63" y1="53" x2="69" y2="62" stroke-width="2"/><circle cx="49" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M49,30L49,40" stroke-width="2.5"/><path d="M53,35L37,35" stroke-width="2"/></g></svg>`,
  '7': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-width="2.5" stroke-linecap="round"><circle cx="22" cy="22" r="5" fill="#2D6B18" stroke="none"/><path d="M22,27L22,41"/><path d="M22,41L15,57M22,41L29,57"/><path d="M14,32L40,36"/><circle cx="58" cy="22" r="5" fill="#2D6B18" stroke="none"/><path d="M58,27L58,41"/><path d="M58,41L51,57M58,41L65,57"/><path d="M66,32L40,36"/><path d="M38,36L42,36" stroke-width="5"/></g></svg>`,
  '8': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="36" cy="44" rx="20" ry="9" fill="#2D6B18" stroke="none"/><path d="M56,42L64,32L62,26L56,30Z" fill="#2D6B18" stroke="none"/><path d="M16,44C10,42 6,36 4,28" stroke-width="3.5"/><line x1="48" y1="53" x2="55" y2="62" stroke-width="2.5"/><line x1="42" y1="53" x2="46" y2="62" stroke-width="2.5"/><line x1="28" y1="53" x2="20" y2="62" stroke-width="2.5"/><line x1="22" y1="53" x2="14" y2="62" stroke-width="2.5"/><circle cx="50" cy="24" r="4" fill="#2D6B18" stroke="none"/><path d="M50,28L48,40" stroke-width="2.5"/><path d="M42,32L50,28L57,34" stroke-width="2"/><path d="M63,21C67,30 67,39 63,48" stroke-width="2"/><line x1="63" y1="21" x2="63" y2="48" stroke-width="1.5"/><line x1="45" y1="32" x2="63" y2="26" stroke-width="1.5"/><path d="M61,23L65,26L61,29" stroke-width="1.5"/></g></svg>`,
  '9': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="19" cy="46" rx="13" ry="7" fill="#2D6B18" stroke="none"/><path d="M32,44L39,36L37,30L31,33Z" fill="#2D6B18" stroke="none"/><path d="M6,46C2,44 0,40 1,34" stroke-width="2.5"/><line x1="25" y1="53" x2="30" y2="62" stroke-width="2"/><line x1="15" y1="53" x2="9" y2="62" stroke-width="2"/><circle cx="29" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M29,30L29,40" stroke-width="2.5"/><path d="M25,35L39,32" stroke-width="2"/><ellipse cx="40" cy="55" rx="6" ry="3.5" fill="#2D6B18" stroke="none"/><ellipse cx="61" cy="46" rx="13" ry="7" fill="#2D6B18" stroke="none"/><path d="M48,44L41,36L43,30L49,33Z" fill="#2D6B18" stroke="none"/><path d="M74,46C78,44 80,40 79,34" stroke-width="2.5"/><line x1="55" y1="53" x2="50" y2="62" stroke-width="2"/><line x1="65" y1="53" x2="71" y2="62" stroke-width="2"/><circle cx="51" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M51,30L51,40" stroke-width="2.5"/><path d="M55,35L41,32" stroke-width="2"/></g></svg>`,
  '10': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="22" cy="48" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M36,46L43,38L41,32L35,35Z" fill="#2D6B18" stroke="none"/><path d="M8,48C4,46 2,42 2,36" stroke-width="2.5"/><line x1="28" y1="55" x2="33" y2="62" stroke-width="2"/><line x1="18" y1="55" x2="12" y2="62" stroke-width="2"/><circle cx="33" cy="29" r="3.5" fill="#2D6B18" stroke="none"/><path d="M33,32L32,42" stroke-width="2.5"/><path d="M29,37L47,36" stroke-width="2.5"/><ellipse cx="58" cy="44" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M72,42L78,34L76,28L70,31Z" fill="#2D6B18" stroke="none"/><path d="M44,44C40,42 38,38 38,32" stroke-width="2.5"/><line x1="64" y1="51" x2="69" y2="62" stroke-width="2"/><line x1="54" y1="51" x2="48" y2="62" stroke-width="2"/><circle cx="67" cy="25" r="3.5" fill="#2D6B18" stroke="none"/><path d="M67,28L66,39" stroke-width="2.5"/><path d="M63,33L45,36" stroke-width="2.5"/></g></svg>`,
  '11': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="37" cy="42" rx="21" ry="9" fill="#2D6B18" stroke="none"/><path d="M58,39L68,27L66,21L60,25L58,33Z" fill="#2D6B18" stroke="none"/><path d="M16,42C8,38 4,32 2,24" stroke-width="3.5"/><line x1="50" y1="51" x2="57" y2="61" stroke-width="2.5"/><line x1="44" y1="51" x2="48" y2="61" stroke-width="2.5"/><line x1="30" y1="51" x2="22" y2="61" stroke-width="2.5"/><line x1="24" y1="51" x2="16" y2="61" stroke-width="2.5"/><circle cx="48" cy="23" r="4" fill="#2D6B18" stroke="none"/><path d="M48,27Q42,34 34,49" stroke-width="2.5"/><path d="M44,27L56,30" stroke-width="2"/><circle cx="28" cy="58" r="3.5" fill="none" stroke-width="2"/><circle cx="28" cy="58" r="1.5" fill="#2D6B18" stroke="none"/></g></svg>`,
  '12': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="30" cy="30" rx="17" ry="7" fill="#2D6B18" stroke="none"/><path d="M47,28L55,20L53,15L47,19Z" fill="#2D6B18" stroke="none"/><path d="M13,30C7,28 4,23 3,17" stroke-width="3"/><line x1="38" y1="37" x2="44" y2="46" stroke-width="2"/><line x1="32" y1="37" x2="36" y2="46" stroke-width="2"/><line x1="22" y1="37" x2="16" y2="46" stroke-width="2"/><line x1="18" y1="37" x2="11" y2="46" stroke-width="2"/><circle cx="44" cy="18" r="3.5" fill="#2D6B18" stroke="none"/><path d="M44,21L42,28" stroke-width="2"/><ellipse cx="52" cy="49" rx="17" ry="7" fill="#2D6B18" stroke="none"/><path d="M35,47L27,39L29,35L35,38Z" fill="#2D6B18" stroke="none"/><path d="M69,49C75,47 78,43 77,37" stroke-width="3"/><line x1="60" y1="56" x2="66" y2="62" stroke-width="2"/><line x1="54" y1="56" x2="58" y2="62" stroke-width="2"/><line x1="44" y1="56" x2="38" y2="62" stroke-width="2"/><line x1="40" y1="56" x2="33" y2="62" stroke-width="2"/><circle cx="38" cy="37" r="3.5" fill="#2D6B18" stroke="none"/><path d="M38,40L40,47" stroke-width="2"/></g></svg>`,
  '13': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="#2D6B18" stroke="#2D6B18" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="25" r="4"/><path d="M8,29L8,42M3,36L16,36M8,42L4,55M8,42L12,55" fill="none" stroke-width="2.5"/><circle cx="19" cy="23" r="4"/><path d="M19,27L19,40M14,33L27,33M19,40L15,53M19,40L23,53" fill="none" stroke-width="2.5"/><circle cx="72" cy="25" r="4"/><path d="M72,29L72,42M64,36L77,36M72,42L68,55M72,42L76,55" fill="none" stroke-width="2.5"/><circle cx="61" cy="23" r="4"/><path d="M61,27L61,40M53,33L66,33M61,40L57,53M61,40L65,53" fill="none" stroke-width="2.5"/><path d="M27,33L53,33" fill="none" stroke-width="4" stroke-linecap="round"/><line x1="40" y1="27" x2="40" y2="38" fill="none" stroke-width="2"/><polygon points="40,24 47,27 40,27"/></g></svg>`,
  'default': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F5EDD8"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-width="2.5" stroke-linecap="round"><circle cx="40" cy="26" r="5" fill="#2D6B18" stroke="none"/><path d="M40,31L40,46"/><path d="M28,38L52,38"/><path d="M40,46L32,59M40,46L48,59"/><circle cx="40" cy="40" r="18" stroke-width="1.5" opacity="0.3"/></g></svg>`,
};

/* ── Sports Ticker ── */
/* sportRegistry stores sport objects by stable key for safe modal lookup.
   Data never passes through HTML attributes — no injection surface. */
const sportRegistry = new Map();

(async function initTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    let sports = [];
    try {
        const r = await fetch('/api/sports');
        const d = await r.json();
        sports = Array.isArray(d) ? d : (d.data || []);
    } catch (e) {}

    if (!sports.length) return;

    const lang = localStorage.getItem('site-lang') || 'ru';

    // Populate registry before building HTML so click handler can look up safely
    sports.forEach((s, i) => sportRegistry.set(String(i), s));

    function makeCard(s, idx) {
        const name = lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu;
        const icon = SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default'];
        // data-sport-idx carries only a numeric index — no user data in HTML attributes
        return `<div class="ticker-card" data-sport-idx="${idx}"
            onmouseenter="document.getElementById('tickerTrack').style.animationPlayState='paused'"
            onmouseleave="document.getElementById('tickerTrack').style.animationPlayState='running'">
            <div class="ticker-icon">${icon}</div>
            <span class="ticker-name">${escapeHtml(name)}</span>
        </div>`;
    }

    const cards = sports.map((s, i) => makeCard(s, i)).join('');
    track.innerHTML = cards + cards;

    // Event delegation — one listener, no inline onclick, no data in HTML
    track.addEventListener('click', e => {
        const card = e.target.closest('.ticker-card[data-sport-idx]');
        if (!card) return;
        const s = sportRegistry.get(card.dataset.sportIdx);
        if (s) openSportModal(s);
    });
})();

window.openSportModal = function (s) {
    // Accept sport object directly — data never travels through the DOM
    const lang = localStorage.getItem('site-lang') || 'ru';
    const name = lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu;
    const desc = lang === 'ky' ? (s.descriptionKy || s.descriptionRu) : s.descriptionRu;
    document.getElementById('modalIcon').innerHTML = SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default'];
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = desc || '';
    const extra = document.getElementById('modalExtra');
    const count = s.athletesCount || s.athleteCount;
    extra.innerHTML = count
        ? `<div class="modal-stat"><strong>${Number(count)}</strong><span>${lang === 'ky' ? 'спортчу' : 'спортсменов'}</span></div>`
        : '';
    document.getElementById('sportModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeSportModal = function () {
    document.getElementById('sportModal').classList.add('hidden');
    document.body.style.overflow = '';
};

/* ── Home News Cards ── */
(async function loadHomeNews() {
    const grid = document.getElementById('homeNewsGrid');
    if (!grid) return;

    const lang = localStorage.getItem('site-lang') || 'ru';
    const fallbackImg = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70';

    let items = [];
    try {
        const r = await fetch('/api/news?status=published&limit=3');
        const d = await r.json();
        items = Array.isArray(d) ? d : (d.data || []);
    } catch (e) {}

    if (!items.length) {
        grid.innerHTML = `<p style="color:#666;text-align:center;grid-column:1/-1;padding:40px">
            ${lang === 'ky' ? 'Жаңылыктар жок' : 'Новостей пока нет'}
        </p>`;
        return;
    }

    grid.innerHTML = items.map(n => {
        const title = escapeHtml(lang === 'ky' ? (n.titleKy || n.titleRu) : (n.titleRu || n.titleKy));
        const img = escapeHtml(n.image || fallbackImg);
        const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ru-RU') : '';
        const catMap = { news: lang === 'ky' ? 'Жаңылык' : 'Новость', announcement: lang === 'ky' ? 'Билдирүү' : 'Объявление', result: lang === 'ky' ? 'Натыйжа' : 'Результат' };
        const cat = catMap[n.category] || '';
        return `
            <div class="news-card scroll-reveal">
                <div class="news-card-img" style="background-image:url('${img}')">
                    <div class="news-img-overlay"></div>
                    ${cat ? `<span class="news-cat-badge">${cat}</span>` : ''}
                </div>
                <div class="news-card-body">
                    <h3 class="news-card-title">${title}</h3>
                    <p class="news-card-date">${date}</p>
                    <a href="news.html" class="news-read-link">${lang === 'ky' ? 'Окуу →' : 'Читать →'}</a>
                </div>
            </div>`;
    }).join('');

    const obs = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('revealed'), i * 150);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
})();

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initRevealAnimations();
    initCounterAnimation();
    initSmoothScroll();
    initLightbox();
    initLangSwitcher();
    loadFooterFromSettings();
    // Dynamic copyright year
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            window.closeSportModal  && window.closeSportModal();
            window.closeEventModal  && window.closeEventModal();
        }
    });
});

/* ── Footer: load phone/email/social from settings API ── */
async function loadFooterFromSettings() {
    try {
        const s = await fetch('/api/settings').then(r => r.json());

        // Update phone in all footer contact lists
        if (s.phone) {
            document.querySelectorAll('.footer__contacts li').forEach(li => {
                if (li.textContent.includes('+996') || li.innerHTML.includes('phone')) {
                    const svg = li.querySelector('svg');
                    li.textContent = '';
                    if (svg) { li.appendChild(svg); li.appendChild(document.createTextNode(' ')); }
                    li.appendChild(document.createTextNode(s.phone));
                }
            });
        }

        // Update email
        if (s.email) {
            document.querySelectorAll('.footer__contacts li').forEach(li => {
                if (li.textContent.includes('@') || li.innerHTML.includes('mail')) {
                    const svg = li.querySelector('svg');
                    li.textContent = '';
                    if (svg) { li.appendChild(svg); li.appendChild(document.createTextNode(' ')); }
                    li.appendChild(document.createTextNode(s.email));
                }
            });
        }

        // Update social links if configured
        const socials = {
            'Instagram':  s.socialInstagram,
            'Telegram':   s.socialTelegram,
            'YouTube':    s.socialYoutube,
            'ВКонтакте':  s.socialVk,
        };
        document.querySelectorAll('.social-link').forEach(a => {
            const label = a.getAttribute('aria-label') || '';
            const url = socials[label];
            if (url) {
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                // Remove the click-prevent handler added by ux.js
                a.replaceWith(a.cloneNode(true));
            }
        });
    } catch(e) {}
}

/* ---------- Language Switcher ---------- */
function initLangSwitcher() {
    const lang = localStorage.getItem('site-lang') || 'ru';
    applyLang(lang, false);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
}

function applyLang(lang, save) {
    if (save !== false) localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang;
    document.body.className = document.body.className.replace(/\blang-\w+\b/g, '').trim();
    document.body.classList.add('lang-' + lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
    });
    // Update placeholders
    document.querySelectorAll('[data-ph-ru]').forEach(el => {
        el.placeholder = lang === 'ky' ? el.dataset.phKy : el.dataset.phRu;
    });
    // Update select options
    document.querySelectorAll('option[data-ru]').forEach(el => {
        el.textContent = lang === 'ky' ? el.dataset.ky : el.dataset.ru;
    });
    // Re-render hero slides in new language without losing position
    if (heroSlides.length) renderHeroSlides();
}

/* ---------- Header Scroll Effect ---------- */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }, { passive: true });
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    function openMenu() {
        burger.classList.add('burger--active');
        nav.classList.add('nav--open');
        backdrop.classList.add('nav-backdrop--visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        burger.classList.remove('burger--active');
        nav.classList.remove('nav--open');
        backdrop.classList.remove('nav-backdrop--visible');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
        nav.classList.contains('nav--open') ? closeMenu() : openMenu();
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav--open')) closeMenu();
    });
}

/* ---------- Reveal on Scroll (Intersection Observer) ---------- */
function initRevealAnimations() {
    const reveals = document.querySelectorAll(
        '.sport-card, .event-card, .news-card, .news-full-card, .value-card, ' +
        '.stat-item, .team-card, .contact-info__item, .sport-detail, .gallery-item, [class*="reveal"]'
    );

    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('reveal--visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) translateX(0) scale(1)';
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => {
        if (!el.classList.contains('reveal--visible')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        observer.observe(el);
    });
}

/* ---------- Counter Animation ---------- */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-item__number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function formatNumber(num) {
        if (num >= 10000) return Math.floor(num / 1000) + ' 000+';
        return num.toString();
    }

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        element.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatNumber(target);
        }
    }

    requestAnimationFrame(update);
}

/* ---------- Smooth Scroll for Anchor Links ---------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ---------- Contact Form ---------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        const lang = localStorage.getItem('site-lang') || 'ru';

        let isValid = true;
        form.querySelectorAll('[required]').forEach(input => {
            const ok = input.value.trim();
            input.style.borderColor = ok ? '' : 'var(--color-primary)';
            if (!ok) isValid = false;
        });
        if (!isValid) return;

        const origHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = lang === 'ky'
            ? '<span class="t-ky">Жиберилүүдө...</span>'
            : '<span class="t-ru">Отправка...</span>';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:    form.querySelector('[name="name"]')?.value.trim(),
                    email:   form.querySelector('[name="email"]')?.value.trim(),
                    subject: form.querySelector('[name="subject"]')?.value,
                    message: form.querySelector('[name="message"]')?.value.trim()
                })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Ошибка');
            btn.innerHTML = lang === 'ky'
                ? '<span class="t-ky">✓ Жиберилди!</span>'
                : '<span class="t-ru">✓ Отправлено!</span>';
            btn.style.background = 'var(--color-accent-light, #2D6A4F)';
            form.reset();
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        } catch (err) {
            const prefix = lang === 'ky' ? 'Ката: ' : 'Ошибка: ';
            btn.textContent = prefix + (err.message || '');
            btn.style.background = '#c0392b';
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactForm);

/* ---------- Lightbox ---------- */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox__close" aria-label="Закрыть">✕</button>
        <button class="lightbox__nav lightbox__prev" aria-label="Предыдущее">‹</button>
        <img class="lightbox__img" src="" alt="">
        <button class="lightbox__nav lightbox__next" aria-label="Следующее">›</button>
        <div class="lightbox__caption"></div>
        <div class="lightbox__counter"></div>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('.lightbox__img');
    const caption = lightbox.querySelector('.lightbox__caption');
    const counter = lightbox.querySelector('.lightbox__counter');
    let currentIndex = 0;
    const items = Array.from(galleryItems);

    function openAt(index) {
        currentIndex = index;
        const item = items[index];
        const src = item.querySelector('img')?.src || '';
        const cap = item.dataset.caption || item.querySelector('.gallery-item__caption')?.textContent || '';
        img.src = src;
        img.alt = cap;
        caption.textContent = cap;
        counter.textContent = `${index + 1} / ${items.length}`;
        lightbox.classList.add('lightbox--open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.classList.remove('lightbox--open');
        document.body.style.overflow = '';
        img.src = '';
    }

    items.forEach((item, i) => {
        item.addEventListener('click', () => openAt(i));
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => {
        openAt((currentIndex - 1 + items.length) % items.length);
    });
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => {
        openAt((currentIndex + 1) % items.length);
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('lightbox--open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') openAt((currentIndex - 1 + items.length) % items.length);
        if (e.key === 'ArrowRight') openAt((currentIndex + 1) % items.length);
    });
}

/* ── Athletes Page ── */
var allAthletes = [];
var currentRoleTab = 'all';
var currentSearchQuery = '';
var activeSportFilter = '';
var _athleteSearchTimer = null;

async function loadAthletesPage() {
    try {
        const r = await fetch('/api/people');
        const d = await r.json();
        allAthletes = Array.isArray(d) ? d : (d.data || []);
    } catch (e) {
        allAthletes = [];
    }
    buildSportChips();
    renderAthletes();
}

function buildSportChips() {
    const container = document.getElementById('sportFilterChips');
    if (!container) return;
    const lang = localStorage.getItem('site-lang') || 'ru';

    const sports = [...new Set(allAthletes.filter(a => a.sportRu).map(a => a.sportRu))].sort();
    const chips = [{ ru: 'Все', ky: 'Баары', val: '' }, ...sports.map(s => {
        const a = allAthletes.find(p => p.sportRu === s);
        return { ru: s, ky: a?.sportKy || s, val: s };
    })];

    // Use data-sport attribute + event delegation — no sport value in onclick="" attributes
    container.innerHTML = chips.map((c, i) => `
        <button class="sport-chip${activeSportFilter === c.val ? ' active' : ''}"
                data-sport-chip="${i}">
            <span class="t-ru">${escapeHtml(c.ru)}</span>
            <span class="t-ky">${escapeHtml(c.ky)}</span>
        </button>
    `).join('');

    // Store chip values in a registry to avoid inline event data
    const chipRegistry = chips;
    container.addEventListener('click', e => {
        const btn = e.target.closest('[data-sport-chip]');
        if (!btn) return;
        const idx = Number(btn.dataset.sportChip);
        const chip = chipRegistry[idx];
        if (chip) filterBySport(chip.val, btn);
    });
}

function filterBySport(sport, btn) {
    activeSportFilter = sport;
    document.querySelectorAll('.sport-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderAthletes();
}
window.filterBySport = filterBySport;

function setRoleTab(role, btn) {
    currentRoleTab = role;
    document.querySelectorAll('.athlete-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }
    renderAthletes();
}
window.setRoleTab = setRoleTab;

function filterAthletes(query) {
    clearTimeout(_athleteSearchTimer);
    _athleteSearchTimer = setTimeout(() => {
        currentSearchQuery = query.trim().toLowerCase();
        renderAthletes();
    }, 250);
}
window.filterAthletes = filterAthletes;

function renderAthletes() {
    const grid  = document.getElementById('athletesGrid');
    const empty = document.getElementById('athletesEmpty');
    if (!grid) return;

    const lang = localStorage.getItem('site-lang') || 'ru';

    const filtered = allAthletes.filter(a => {
        if (currentRoleTab !== 'all' && a.role !== currentRoleTab) return false;
        if (activeSportFilter && a.sportRu !== activeSportFilter) return false;
        if (currentSearchQuery) {
            const name  = (lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || '')).toLowerCase();
            const sport = (lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || '')).toLowerCase();
            const title = (lang === 'ky' ? (a.titleKy || a.titleRu || '') : (a.titleRu || a.titleKy || '')).toLowerCase();
            if (!name.includes(currentSearchQuery) && !sport.includes(currentSearchQuery) && !title.includes(currentSearchQuery)) return false;
        }
        return true;
    });

    if (!filtered.length) {
        grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }
    if (empty) empty.classList.add('hidden');

    const roleMap = {
        athlete: { ru: 'Спортсмен',  ky: 'Спортчу' },
        coach:   { ru: 'Тренер',     ky: 'Машыктыруучу' },
        staff:   { ru: 'Сотрудник',  ky: 'Кызматкер' }
    };

    grid.innerHTML = filtered.map(a => {
        const name       = escapeHtml(lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || ''));
        const sport      = escapeHtml(lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || ''));
        const title      = escapeHtml(lang === 'ky' ? (a.titleKy || a.titleRu || '') : (a.titleRu || a.titleKy || ''));
        const roleMeta   = roleMap[a.role] || { ru: '', ky: '' };
        const roleLabel  = escapeHtml(lang === 'ky' ? roleMeta.ky : roleMeta.ru);
        const isRetired  = a.careerStatus === 'retired';
        const achievements = (lang === 'ky' ? a.achievementsKy : a.achievementsRu) || [];
        const achList    = (Array.isArray(achievements) ? achievements : []).slice(0, 2);

        const initials  = name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
        const photoHtml = a.photo
            ? `<img src="${escapeHtml(a.photo)}" alt="${name}" class="athlete-photo" loading="lazy"
                    onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="athlete-initials" style="display:none">${initials}</div>`
            : `<div class="athlete-initials">${initials}</div>`;

        return `
        <article class="athlete-card" onclick="openAthleteBio('${escapeHtml(String(a.id))}')">
            <div class="athlete-photo-wrap">
                ${photoHtml}
                <span class="athlete-role-badge athlete-role-badge--${a.role || 'athlete'}">${roleLabel}</span>
            </div>
            <div class="athlete-card-body">
                <h3 class="athlete-name">${name}</h3>
                ${sport ? `<p class="athlete-sport">${sport}</p>` : ''}
                ${title ? `<p class="athlete-title">${title}</p>` : ''}
                ${achList.length ? `<ul class="athlete-achievements">${achList.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}</ul>` : ''}
                <span class="athlete-status athlete-status--${isRetired ? 'retired' : 'active'}">
                    <span class="t-ru">${isRetired ? 'В отставке' : 'Действующий'}</span>
                    <span class="t-ky">${isRetired ? 'Зейнеткерде' : 'Активдүү'}</span>
                </span>
            </div>
        </article>`;
    }).join('');
}

function openAthleteBio(id) {
    const a = allAthletes.find(x => String(x.id) === String(id));
    if (!a) return;
    const lang = localStorage.getItem('site-lang') || 'ru';
    const name  = escapeHtml(lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || ''));
    const sport = escapeHtml(lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || ''));
    const title = escapeHtml(lang === 'ky' ? (a.titleKy || a.titleRu || '') : (a.titleRu || a.titleKy || ''));
    const bio   = lang === 'ky' ? (a.bioKy || a.bioRu || '') : (a.bioRu || a.bioKy || '');
    const isRetired = a.careerStatus === 'retired';
    const initials  = name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
    const photoHtml = a.photo
        ? `<img class="bio-photo" src="${escapeHtml(a.photo)}" alt="${name}"
               onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="bio-initials" style="display:none">${initials}</div>`
        : `<div class="bio-initials">${initials}</div>`;
    const achievements = (lang === 'ky' ? a.achievementsKy : a.achievementsRu) || [];
    const achArr = Array.isArray(achievements) ? achievements : [];
    const statusLabel = lang === 'ky'
        ? (isRetired ? 'Зейнеткерде' : 'Активдүү')
        : (isRetired ? 'В отставке'  : 'Действующий');

    document.getElementById('athleteBioContent').innerHTML = `
        <div class="bio-header">
            ${photoHtml}
            <div class="bio-header-info">
                <div class="bio-name">${name}</div>
                ${sport ? `<div class="bio-sport">${sport}</div>` : ''}
                ${title ? `<div class="bio-title-txt">${title}</div>` : ''}
                <span class="bio-badge${isRetired ? ' bio-badge--retired' : ''}">${statusLabel}</span>
            </div>
        </div>
        <div class="bio-body">
            ${bio ? `<div class="bio-section"><div class="bio-section-title">${lang === 'ky' ? 'Өмүр баяны' : 'Биография'}</div><p class="bio-text">${escapeHtml(bio)}</p></div>` : ''}
            ${achArr.length ? `<div class="bio-section"><div class="bio-section-title">${lang === 'ky' ? 'Жетишкендиктер' : 'Достижения'}</div><ul class="bio-achievements">${achArr.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}</ul></div>` : ''}
            ${!bio && !achArr.length ? `<p class="bio-text" style="color:#999;text-align:center;padding:12px 0">${lang === 'ky' ? 'Маалымат жок' : 'Информация не добавлена'}</p>` : ''}
        </div>`;
    const modal = document.getElementById('athleteBioModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAthleteBio(e) {
    if (e && e.target !== document.getElementById('athleteBioModal')) return;
    document.getElementById('athleteBioModal').classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAthleteBio();
});

/* Minimal HTML sanitizer for user-generated rich text (news content).
   Allows only safe formatting tags and strips all attributes. */
function sanitizeHtml(html) {
    if (!html) return '';
    const ALLOWED = new Set(['P','BR','STRONG','B','EM','I','UL','OL','LI','H2','H3','H4','BLOCKQUOTE','SPAN']);
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    wrap.querySelectorAll('*').forEach(el => {
        if (!ALLOWED.has(el.tagName)) {
            el.replaceWith(document.createTextNode(el.textContent));
        } else {
            // strip every attribute — prevents onerror, onclick, style, etc.
            Array.from(el.attributes).forEach(a => el.removeAttribute(a.name));
        }
    });
    return wrap.innerHTML;
}
window.sanitizeHtml = sanitizeHtml;

if (window.location.pathname === '/athletes' || window.location.pathname.endsWith('/athletes.html')) {
    document.addEventListener('DOMContentLoaded', loadAthletesPage);
}

/* ── Home Athletes Preview ── */
async function loadHomeAthletes() {
    const grid = document.getElementById('homeAthletesGrid');
    if (!grid) return;
    const lang = localStorage.getItem('site-lang') || 'ru';
    try {
        const r = await fetch('/api/people');
        const d = await r.json();
        const athletes = (Array.isArray(d) ? d : (d.data || []))
            .filter(a => a.status === 'published' && a.role === 'athlete')
            .sort((a, b) => (parseInt(a.order) || 99) - (parseInt(b.order) || 99))
            .slice(0, 4);
        if (!athletes.length) { grid.closest('section')?.remove(); return; }
        grid.innerHTML = athletes.map(a => {
            const name  = lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || '');
            const sport = lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || '');
            const photo = a.photo || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80';
            return `<div class="athlete-preview-card">
                <img class="athlete-preview-card__img" src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80'">
                <div class="athlete-preview-card__body">
                    <div class="athlete-preview-card__name">${escapeHtml(name)}</div>
                    <div class="athlete-preview-card__sport">${escapeHtml(sport)}</div>
                </div>
            </div>`;
        }).join('');
    } catch {
        grid.closest('section')?.remove();
    }
}
document.addEventListener('DOMContentLoaded', loadHomeAthletes);

/* ── Home Sports Grid ── */
async function loadHomeSports() {
    const grid = document.getElementById('homeSportsGrid');
    if (!grid) return;
    const lang = localStorage.getItem('site-lang') || 'ru';
    try {
        const r = await fetch('/api/sports?status=published&limit=6');
        const d = await r.json();
        const sports = (Array.isArray(d) ? d : (d.data || [])).slice(0, 6);
        if (!sports.length) { grid.innerHTML = ''; return; }

        const homeSportRegistry = sports;

        grid.innerHTML = sports.map((s, i) => {
            const nameRu = escapeHtml(s.nameRu || '');
            const nameKy = escapeHtml(s.nameKy || s.nameRu || '');
            const descRu = escapeHtml((s.descriptionRu || '').slice(0, 120));
            const descKy = escapeHtml((s.descriptionKy || s.descriptionRu || '').slice(0, 120));
            const icon   = SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default'];
            return `<article class="sport-card sport-card--clickable" data-sport-home-idx="${i}" style="cursor:pointer">
                <div class="sport-card__icon" aria-hidden="true">${icon}</div>
                <h3 class="sport-card__title"><span class="t-ru">${nameRu}</span><span class="t-ky">${nameKy}</span></h3>
                <p class="sport-card__text"><span class="t-ru">${descRu}…</span><span class="t-ky">${descKy}…</span></p>
                <span class="sport-card__link"><span class="t-ru">Подробнее →</span><span class="t-ky">Толугураак →</span></span>
            </article>`;
        }).join('');

        grid.addEventListener('click', e => {
            const card = e.target.closest('[data-sport-home-idx]');
            if (!card) return;
            const s = homeSportRegistry[Number(card.dataset.sportHomeIdx)];
            if (s) openSportModal(s);
        });
    } catch {
        grid.innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', loadHomeSports);

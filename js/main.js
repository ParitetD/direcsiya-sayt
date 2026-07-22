/* ==========================================================================
   National Sports Website — Main JavaScript
   ========================================================================== */

/* ── XSS Protection: sanitize HTML before insertion ── */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
}

/* ── Localization helper ── */
function t(ru, ky, en) {
    const l = localStorage.getItem('site-lang') || 'ru';
    if (l === 'ky') return ky || ru || '';
    if (l === 'en') return en || ru || '';
    return ru || '';
}

/* ── Hero Slideshow ── */
var heroSlides      = [];
var currentSlide    = 0;
var slideTimer      = null;
var heroImgA        = null;
var heroImgB        = null;
var activeImgLayer  = 'a';

function _heroText(s, lang) {
    if (lang === 'en') return {
        title:    s.titleEn    || s.titleRu    || s.titleKy    || '',
        subtitle: s.subtitleEn || s.subtitleRu || s.subtitleKy || ''
    };
    if (lang === 'ky') return {
        title:    s.titleKy    || s.titleRu    || '',
        subtitle: s.subtitleKy || s.subtitleRu || ''
    };
    return { title: s.titleRu || '', subtitle: s.subtitleRu || '' };
}

function _heroPanelHTML(s, lang) {
    const txt = _heroText(s, lang);
    const eyebrow = lang === 'en' ? 'KYRGYZSTAN · NATIONAL SPORTS'
                  : lang === 'ky' ? 'КЫРГЫЗСТАН · УЛУТТУК СПОРТ'
                  : 'КЫРГЫЗСТАН · НАЦИОНАЛЬНЫЙ СПОРТ';
    const lSports   = lang === 'en' ? 'sports'   : lang === 'ky' ? 'спорт түрү' : 'вида спорта';
    const lAthletes = lang === 'en' ? 'athletes' : lang === 'ky' ? 'спортчу'    : 'спортсменов';
    const lRegions  = lang === 'en' ? 'regions'  : lang === 'ky' ? 'облус'      : 'областей';
    const lSports2  = lang === 'en' ? 'Sports'   : lang === 'ky' ? 'Спорт түрлөрү' : 'Виды спорта';
    const lEvents   = lang === 'en' ? 'Events'   : lang === 'ky' ? 'Иш-чаралар'    : 'Мероприятия';
    return `
        <div class="hero-eyebrow">
            <span class="hero-eyebrow-bar"></span>
            <span class="hero-eyebrow-text">${escapeHtml(eyebrow)}</span>
            <span class="hero-eyebrow-bar"></span>
        </div>
        <img src="/logo.png" class="hero-logo" onerror="this.style.display='none'" alt="ДНВС">
        <h1 class="hero-title" id="heroTitle">${escapeHtml(txt.title)}</h1>
        <div class="hero-separator"></div>
        <p class="hero-sub" id="heroSub">${escapeHtml(txt.subtitle)}</p>
        <div class="hero-kpi-row">
            <div class="hero-kpi"><strong class="hero-kpi-num" data-target="18">0</strong><span class="hero-kpi-lbl">${lSports}</span></div>
            <span class="hero-kpi-sep">◆</span>
            <div class="hero-kpi"><strong class="hero-kpi-num" data-target="5000" data-suffix="+">0</strong><span class="hero-kpi-lbl">${lAthletes}</span></div>
            <span class="hero-kpi-sep">◆</span>
            <div class="hero-kpi"><strong class="hero-kpi-num" data-target="7">0</strong><span class="hero-kpi-lbl">${lRegions}</span></div>
        </div>
        <div class="hero-btns">
            <a href="sports.html" class="btn-hero-primary">${lSports2}</a>
            <a href="events.html" class="btn-hero-outline">${lEvents}</a>
        </div>
    `;
}

function buildHeroPanel(slide) {
    const panel = document.getElementById('heroPanel');
    if (!panel) return;
    const lang = localStorage.getItem('site-lang') || 'ru';
    panel.innerHTML = '<div id="heroStaticContent" class="hero-content">' + _heroPanelHTML(slide, lang) + '</div>';
    if (window.initCounterAnimation) initCounterAnimation();
}

function updateHeroText(slide) {
    var lang    = localStorage.getItem('site-lang') || 'ru';
    var txt     = _heroText(slide, lang);
    var titleEl = document.getElementById('heroTitle');
    var subEl   = document.getElementById('heroSub');
    // Phase 1: fade out — plain opacity, no filter/blur involved
    [titleEl, subEl].forEach(function(el) {
        if (!el) return;
        el.style.opacity = '0';
    });
    setTimeout(function() {
        // Phase 2: update content, snap to entry position above (no transition)
        if (titleEl) titleEl.textContent = txt.title;
        if (subEl)   subEl.textContent   = txt.subtitle;
        [titleEl, subEl].forEach(function(el) {
            if (!el) return;
            el.style.transition = 'none';
            el.style.transform  = 'translateY(-10px)';
        });
        // Phase 3: two rAFs to ensure browser paints the snap before animating
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                [titleEl, subEl].forEach(function(el) {
                    if (!el) return;
                    el.style.transition = '';
                    el.style.opacity    = '1';
                    el.style.transform  = 'translateY(0)';
                });
            });
        });
    }, 500);
}

function renderHeroSlides() {
    const container = document.getElementById('heroSlides');
    const frameEl   = document.getElementById('heroFrame');
    const dotsEl    = document.getElementById('heroDots');
    if (!container || !frameEl || !heroSlides.length) return;

    heroImgA = null;
    heroImgB = null;
    activeImgLayer = 'a';

    // Inject images into the frame (dots stay in container — not touched)
    frameEl.innerHTML = `
        <img class="hero-img-layer" id="heroImgA" src="${escapeHtml(heroSlides[0].image)}" alt="" loading="eager" fetchpriority="high">
        <img class="hero-img-layer" id="heroImgB" src="" alt="" loading="lazy">
    `;

    heroImgA = document.getElementById('heroImgA');
    heroImgB = document.getElementById('heroImgB');
    if (heroImgA) heroImgA.classList.add('active');
    if (heroImgB) heroImgB.classList.remove('active');

    buildHeroPanel(heroSlides[currentSlide]);

    if (dotsEl) {
        dotsEl.innerHTML = heroSlides.map((_, i) =>
            '<span class="hero-dot' + (i === currentSlide ? ' active' : '') +
            '" onclick="goSlide(' + i + ');startSlider()"></span>'
        ).join('');
    }
}

function goSlide(n) {
    var imgA = document.getElementById('heroImgA');
    var imgB = document.getElementById('heroImgB');
    if (!imgA || !imgB) return;

    var dotsEl   = document.getElementById('heroDots');
    var allDots  = dotsEl ? dotsEl.querySelectorAll('.hero-dot') : [];
    var allSlides = [imgA, imgB];

    allDots[currentSlide] && allDots[currentSlide].classList.remove('active');

    currentSlide = ((n % heroSlides.length) + heroSlides.length) % heroSlides.length;
    allDots[currentSlide] && allDots[currentSlide].classList.add('active');

    var nextLayer = activeImgLayer === 'a' ? 'b' : 'a';
    var nextImg   = nextLayer === 'a' ? imgA : imgB;
    var curImg    = activeImgLayer === 'a' ? imgA : imgB;
    var s = heroSlides[currentSlide];

    if (nextImg && s) {
        var onReady = function() {
            nextImg.classList.add('active');
            curImg.classList.remove('active');
            activeImgLayer = nextLayer;
        };
        nextImg.onload = onReady;
        if (nextImg.complete && nextImg.src === s.image) {
            onReady();
        } else {
            nextImg.src = s.image;
        }
    }

    updateHeroText(s);
    startSlider();
}
window.goSlide = goSlide;

function startSlider() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function() { goSlide(currentSlide + 1); }, 5000);
}
window.startSlider = startSlider;

async function initHeroSlider() {
    try {
        var r = await fetch('/api/slides');
        var d = await r.json();
        heroSlides = (Array.isArray(d) ? d : (d.data || []))
            .filter(function(s) { return s.active !== false && s.active !== 'false'; })
            .sort(function(a, b) { return (parseInt(a.order) || 0) - (parseInt(b.order) || 0); });
    } catch (e) {}

    if (!heroSlides.length) {
        heroSlides = [
            {
                image: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=900&q=90',
                titleRu: 'Дирекция национальных видов спорта Кыргызстана',
                titleKy: 'Кыргызстандын улуттук спорт түрлөрү боюнча дирекциясы',
                titleEn: 'Directorate of National Sports of Kyrgyzstan',
                subtitleRu: 'Сохраняем и развиваем национальные спортивные традиции кыргызского народа',
                subtitleKy: 'Кыргыз элинин улуттук спорт салттарын сактап жана өнүктүрөбүз',
                subtitleEn: 'Preserving and developing national sports traditions of the Kyrgyz people',
                active: true, order: 1
            },
            {
                image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=90',
                titleRu: 'Кыргызские спортсмены — гордость нации',
                titleKy: 'Кыргыз спортчулары — элдин сыймыгы',
                titleEn: 'Kyrgyz Athletes — Pride of the Nation',
                subtitleRu: 'Наши атлеты с честью представляют страну на мировых соревнованиях',
                subtitleKy: 'Биздин спортчулар дүйнөлүк мелдештерде өлкөбүздү намыс менен коргойт',
                subtitleEn: 'Our athletes honourably represent Kyrgyzstan at international competitions',
                active: true, order: 2
            },
            {
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=90',
                titleRu: 'Развитие спорта по всему Кыргызстану',
                titleKy: 'Бүткүл Кыргызстанда спортту өнүктүрүү',
                titleEn: 'Developing Sport Across All of Kyrgyzstan',
                subtitleRu: 'Строим объекты и воспитываем чемпионов в каждом регионе',
                subtitleKy: 'Ар бир аймакта спорт курулуштарын куруп, чемпиондорду тарбиялайбыз',
                subtitleEn: 'Building facilities and raising champions in every region of the country',
                active: true, order: 3
            }
        ];
    }

    renderHeroSlides();
    startSlider();
}

/* ── Partners — replace static list when API has data ── */
(async function loadPartners() {
    const c = document.getElementById('partnersRow');
    if (!c) return;
    try {
        const d = await fetch('/api/partners').then(r => r.json());
        const items = (Array.isArray(d) ? d : (d.data || []))
            .filter(p => p.status !== 'draft')
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        if (!items.length) return;
        const lang = localStorage.getItem('site-lang') || 'ru';
        c.innerHTML = items.map(p => {
            const name = escapeHtml(
                lang === 'ky' ? (p.nameKy || p.nameRu || '') :
                lang === 'en' ? (p.nameEn || p.nameRu || '') :
                (p.nameRu || '')
            );
            const inner = p.logo
                ? `<img src="${escapeHtml(p.logo)}" alt="${name}" style="max-height:44px;max-width:140px;object-fit:contain;display:block">`
                : `<span>${name}</span>`;
            return p.url
                ? `<a href="${escapeHtml(p.url)}" class="partner-item" target="_blank" rel="noopener noreferrer">${inner}</a>`
                : `<div class="partner-item">${inner}</div>`;
        }).join('');
    } catch (e) {}
})();

/* ── Sports Icons — Kyrgyz national ornamental frame ── */
const _si = (f) =>
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/>` +
  `<path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/>` +
  `<path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/>` +
  f + `</svg>`;
const SPORT_ICONS_BY_ID = {
  '1': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round" stroke-linejoin="round"><circle cx="21" cy="22" r="4.5" fill="#2D6B18" stroke="none"/><path d="M21,26Q24,31 29,37" stroke-width="3"/><path d="M12,30Q21,32 38,37" stroke-width="2.5"/><path d="M29,37L22,53M29,37L37,52" stroke-width="2.5"/><circle cx="59" cy="22" r="4.5" fill="#2D6B18" stroke="none"/><path d="M59,26Q56,31 51,37" stroke-width="3"/><path d="M68,30Q59,32 42,37" stroke-width="2.5"/><path d="M51,37L44,52M51,37L58,53" stroke-width="2.5"/><line x1="38" y1="37" x2="42" y2="37" stroke-width="5" stroke-linecap="round"/></g></svg>`,
  '2': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g stroke="#2D6B18"><rect x="5" y="26" width="70" height="33" rx="8" fill="none" stroke-width="2.5"/><line x1="40" y1="26" x2="40" y2="59" stroke-width="1.8"/><circle cx="13" cy="36" r="3.8" fill="#2D6B18"/><circle cx="22" cy="36" r="3.8" fill="#2D6B18"/><circle cx="31" cy="36" r="3.8" fill="#2D6B18"/><circle cx="13" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="22" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="31" cy="49" r="3.8" fill="none" stroke-width="2"/><circle cx="49" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="58" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="67" cy="36" r="3.8" fill="none" stroke-width="2"/><circle cx="49" cy="49" r="3.8" fill="#2D6B18"/><circle cx="58" cy="49" r="3.8" fill="#2D6B18"/><circle cx="67" cy="49" r="3.8" fill="#2D6B18"/></g></svg>`,
  '3': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="37" cy="45" rx="20" ry="9" fill="#2D6B18" stroke="none"/><path d="M57,43L65,33L63,27L57,31Z" fill="#2D6B18" stroke="none"/><path d="M17,45C11,43 7,37 4,29" stroke-width="3.5"/><line x1="49" y1="54" x2="55" y2="62" stroke-width="2.5"/><line x1="43" y1="54" x2="47" y2="62" stroke-width="2.5"/><line x1="29" y1="54" x2="21" y2="62" stroke-width="2.5"/><line x1="23" y1="54" x2="15" y2="62" stroke-width="2.5"/><circle cx="51" cy="28" r="4" fill="#2D6B18" stroke="none"/><path d="M51,32L49,42" stroke-width="2.5"/><path d="M49,37L40,50" stroke-width="2"/><ellipse cx="34" cy="56" rx="5" ry="3" fill="#2D6B18" stroke="none"/></g></svg>`,
  '5': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="38" cy="44" rx="22" ry="10" fill="#2D6B18" stroke="none"/><path d="M60,40L70,28L68,22L62,26L60,34Z" fill="#2D6B18" stroke="none"/><path d="M16,44C8,40 4,34 2,26" stroke-width="3.5"/><line x1="52" y1="54" x2="59" y2="62" stroke-width="2.5"/><line x1="44" y1="54" x2="48" y2="62" stroke-width="2.5"/><line x1="30" y1="54" x2="22" y2="62" stroke-width="2.5"/><line x1="24" y1="54" x2="16" y2="62" stroke-width="2.5"/><circle cx="56" cy="25" r="4" fill="#2D6B18" stroke="none"/><path d="M56,29Q54,36 52,42" stroke-width="2.5"/><path d="M48,32L66,30" stroke-width="2"/></g></svg>`,
  '6': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="21" cy="46" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M35,44L41,36L39,30L34,33Z" fill="#2D6B18" stroke="none"/><path d="M7,46C3,44 1,40 2,34" stroke-width="2.5"/><line x1="27" y1="53" x2="32" y2="62" stroke-width="2"/><line x1="17" y1="53" x2="11" y2="62" stroke-width="2"/><circle cx="31" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M31,30L31,40" stroke-width="2.5"/><path d="M27,35L43,35" stroke-width="2"/><ellipse cx="59" cy="46" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M45,44L39,36L41,30L46,33Z" fill="#2D6B18" stroke="none"/><path d="M73,46C77,44 79,40 78,34" stroke-width="2.5"/><line x1="53" y1="53" x2="48" y2="62" stroke-width="2"/><line x1="63" y1="53" x2="69" y2="62" stroke-width="2"/><circle cx="49" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M49,30L49,40" stroke-width="2.5"/><path d="M53,35L37,35" stroke-width="2"/></g></svg>`,
  '7': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-width="2.5" stroke-linecap="round"><circle cx="22" cy="22" r="5" fill="#2D6B18" stroke="none"/><path d="M22,27L22,41"/><path d="M22,41L15,57M22,41L29,57"/><path d="M14,32L40,36"/><circle cx="58" cy="22" r="5" fill="#2D6B18" stroke="none"/><path d="M58,27L58,41"/><path d="M58,41L51,57M58,41L65,57"/><path d="M66,32L40,36"/><path d="M38,36L42,36" stroke-width="5"/></g></svg>`,
  '8': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="36" cy="44" rx="20" ry="9" fill="#2D6B18" stroke="none"/><path d="M56,42L64,32L62,26L56,30Z" fill="#2D6B18" stroke="none"/><path d="M16,44C10,42 6,36 4,28" stroke-width="3.5"/><line x1="48" y1="53" x2="55" y2="62" stroke-width="2.5"/><line x1="42" y1="53" x2="46" y2="62" stroke-width="2.5"/><line x1="28" y1="53" x2="20" y2="62" stroke-width="2.5"/><line x1="22" y1="53" x2="14" y2="62" stroke-width="2.5"/><circle cx="50" cy="24" r="4" fill="#2D6B18" stroke="none"/><path d="M50,28L48,40" stroke-width="2.5"/><path d="M42,32L50,28L57,34" stroke-width="2"/><path d="M63,21C67,30 67,39 63,48" stroke-width="2"/><line x1="63" y1="21" x2="63" y2="48" stroke-width="1.5"/><line x1="45" y1="32" x2="63" y2="26" stroke-width="1.5"/><path d="M61,23L65,26L61,29" stroke-width="1.5"/></g></svg>`,
  '9': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="19" cy="46" rx="13" ry="7" fill="#2D6B18" stroke="none"/><path d="M32,44L39,36L37,30L31,33Z" fill="#2D6B18" stroke="none"/><path d="M6,46C2,44 0,40 1,34" stroke-width="2.5"/><line x1="25" y1="53" x2="30" y2="62" stroke-width="2"/><line x1="15" y1="53" x2="9" y2="62" stroke-width="2"/><circle cx="29" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M29,30L29,40" stroke-width="2.5"/><path d="M25,35L39,32" stroke-width="2"/><ellipse cx="40" cy="55" rx="6" ry="3.5" fill="#2D6B18" stroke="none"/><ellipse cx="61" cy="46" rx="13" ry="7" fill="#2D6B18" stroke="none"/><path d="M48,44L41,36L43,30L49,33Z" fill="#2D6B18" stroke="none"/><path d="M74,46C78,44 80,40 79,34" stroke-width="2.5"/><line x1="55" y1="53" x2="50" y2="62" stroke-width="2"/><line x1="65" y1="53" x2="71" y2="62" stroke-width="2"/><circle cx="51" cy="27" r="3.5" fill="#2D6B18" stroke="none"/><path d="M51,30L51,40" stroke-width="2.5"/><path d="M55,35L41,32" stroke-width="2"/></g></svg>`,
  '10': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="22" cy="48" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M36,46L43,38L41,32L35,35Z" fill="#2D6B18" stroke="none"/><path d="M8,48C4,46 2,42 2,36" stroke-width="2.5"/><line x1="28" y1="55" x2="33" y2="62" stroke-width="2"/><line x1="18" y1="55" x2="12" y2="62" stroke-width="2"/><circle cx="33" cy="29" r="3.5" fill="#2D6B18" stroke="none"/><path d="M33,32L32,42" stroke-width="2.5"/><path d="M29,37L47,36" stroke-width="2.5"/><ellipse cx="58" cy="44" rx="14" ry="7" fill="#2D6B18" stroke="none"/><path d="M72,42L78,34L76,28L70,31Z" fill="#2D6B18" stroke="none"/><path d="M44,44C40,42 38,38 38,32" stroke-width="2.5"/><line x1="64" y1="51" x2="69" y2="62" stroke-width="2"/><line x1="54" y1="51" x2="48" y2="62" stroke-width="2"/><circle cx="67" cy="25" r="3.5" fill="#2D6B18" stroke="none"/><path d="M67,28L66,39" stroke-width="2.5"/><path d="M63,33L45,36" stroke-width="2.5"/></g></svg>`,
  '11': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="37" cy="42" rx="21" ry="9" fill="#2D6B18" stroke="none"/><path d="M58,39L68,27L66,21L60,25L58,33Z" fill="#2D6B18" stroke="none"/><path d="M16,42C8,38 4,32 2,24" stroke-width="3.5"/><line x1="50" y1="51" x2="57" y2="61" stroke-width="2.5"/><line x1="44" y1="51" x2="48" y2="61" stroke-width="2.5"/><line x1="30" y1="51" x2="22" y2="61" stroke-width="2.5"/><line x1="24" y1="51" x2="16" y2="61" stroke-width="2.5"/><circle cx="48" cy="23" r="4" fill="#2D6B18" stroke="none"/><path d="M48,27Q42,34 34,49" stroke-width="2.5"/><path d="M44,27L56,30" stroke-width="2"/><circle cx="28" cy="58" r="3.5" fill="none" stroke-width="2"/><circle cx="28" cy="58" r="1.5" fill="#2D6B18" stroke="none"/></g></svg>`,
  '12': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="30" cy="30" rx="17" ry="7" fill="#2D6B18" stroke="none"/><path d="M47,28L55,20L53,15L47,19Z" fill="#2D6B18" stroke="none"/><path d="M13,30C7,28 4,23 3,17" stroke-width="3"/><line x1="38" y1="37" x2="44" y2="46" stroke-width="2"/><line x1="32" y1="37" x2="36" y2="46" stroke-width="2"/><line x1="22" y1="37" x2="16" y2="46" stroke-width="2"/><line x1="18" y1="37" x2="11" y2="46" stroke-width="2"/><circle cx="44" cy="18" r="3.5" fill="#2D6B18" stroke="none"/><path d="M44,21L42,28" stroke-width="2"/><ellipse cx="52" cy="49" rx="17" ry="7" fill="#2D6B18" stroke="none"/><path d="M35,47L27,39L29,35L35,38Z" fill="#2D6B18" stroke="none"/><path d="M69,49C75,47 78,43 77,37" stroke-width="3"/><line x1="60" y1="56" x2="66" y2="62" stroke-width="2"/><line x1="54" y1="56" x2="58" y2="62" stroke-width="2"/><line x1="44" y1="56" x2="38" y2="62" stroke-width="2"/><line x1="40" y1="56" x2="33" y2="62" stroke-width="2"/><circle cx="38" cy="37" r="3.5" fill="#2D6B18" stroke="none"/><path d="M38,40L40,47" stroke-width="2"/></g></svg>`,
  '13': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="#2D6B18" stroke="#2D6B18" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="25" r="4"/><path d="M8,29L8,42M3,36L16,36M8,42L4,55M8,42L12,55" fill="none" stroke-width="2.5"/><circle cx="19" cy="23" r="4"/><path d="M19,27L19,40M14,33L27,33M19,40L15,53M19,40L23,53" fill="none" stroke-width="2.5"/><circle cx="72" cy="25" r="4"/><path d="M72,29L72,42M64,36L77,36M72,42L68,55M72,42L76,55" fill="none" stroke-width="2.5"/><circle cx="61" cy="23" r="4"/><path d="M61,27L61,40M53,33L66,33M61,40L57,53M61,40L65,53" fill="none" stroke-width="2.5"/><path d="M27,33L53,33" fill="none" stroke-width="4" stroke-linecap="round"/><line x1="40" y1="27" x2="40" y2="38" fill="none" stroke-width="2"/><polygon points="40,24 47,27 40,27"/></g></svg>`,
  '14': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-linecap="round"><ellipse cx="38" cy="43" rx="20" ry="9" fill="#2D6B18" stroke="none"/><path d="M58,41L67,30L65,24L59,28L57,36Z" fill="#2D6B18" stroke="none"/><path d="M18,43C11,41 7,35 5,27" stroke-width="3.5"/><line x1="50" y1="52" x2="54" y2="63" stroke-width="2.5"/><line x1="44" y1="52" x2="46" y2="63" stroke-width="2.5"/><line x1="30" y1="52" x2="26" y2="63" stroke-width="2.5"/><line x1="24" y1="52" x2="18" y2="63" stroke-width="2.5"/><circle cx="52" cy="26" r="4" fill="#2D6B18" stroke="none"/><path d="M52,30L50,41" stroke-width="2.5"/><path d="M46,33L54,28" stroke-width="2"/><line x1="2" y1="30" x2="10" y2="30" stroke-width="1.5" stroke-dasharray="2,3"/><line x1="2" y1="36" x2="8" y2="36" stroke-width="1.5" stroke-dasharray="2,3"/><line x1="2" y1="42" x2="10" y2="42" stroke-width="1.5" stroke-dasharray="2,3"/></g></svg>`,
  'default': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#C8963E"/><path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/><path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/><g fill="none" stroke="#2D6B18" stroke-width="2.5" stroke-linecap="round"><circle cx="40" cy="26" r="5" fill="#2D6B18" stroke="none"/><path d="M40,31L40,46"/><path d="M28,38L52,38"/><path d="M40,46L32,59M40,46L48,59"/><circle cx="40" cy="40" r="18" stroke-width="1.5" opacity="0.3"/></g></svg>`,
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
        const iconHtml = s.icon
            ? `<img src="${escapeHtml(s.icon)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply">`
            : (SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default']);
        // data-sport-idx carries only a numeric index — no user data in HTML attributes
        return `<div class="ticker-card" data-sport-idx="${idx}"
            onmouseenter="document.getElementById('tickerTrack').style.animationPlayState='paused'"
            onmouseleave="document.getElementById('tickerTrack').style.animationPlayState='running'">
            <div class="ticker-icon">${iconHtml}</div>
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
        if (s) window.location.href = 'sport.html?id=' + encodeURIComponent(s.id);
    });
})();

window.openSportModal = function (s) {
    // Accept sport object directly — data never travels through the DOM
    const lang = localStorage.getItem('site-lang') || 'ru';
    const name = lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu;
    const desc = lang === 'ky' ? (s.descriptionKy || s.descriptionRu) : s.descriptionRu;
    const modalIconEl = document.getElementById('modalIcon');
    if (s.icon) {
        modalIconEl.innerHTML = `<img src="${escapeHtml(s.icon)}" alt="${escapeHtml(name)}" style="width:80px;height:80px;object-fit:contain">`;
    } else {
        modalIconEl.innerHTML = SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default'];
    }
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = desc || '';
    const extra = document.getElementById('modalExtra');
    const count = s.athletesCount || s.athleteCount;
    extra.innerHTML = count
        ? `<div class="modal-stat"><strong>${Number(count)}</strong><span>${t('спортсменов','спортчу','athletes')}</span></div>`
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
            ${t('Новостей пока нет','Жаңылыктар жок','No news yet')}
        </p>`;
        return;
    }

    grid.innerHTML = items.map(n => {
        const title = escapeHtml(lang === 'ky' ? (n.titleKy || n.titleRu) : (n.titleRu || n.titleKy));
        const img = escapeHtml(n.image || fallbackImg);
        const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ru-RU') : '';
        const catMap = {
            news:         t('Новость','Жаңылык','News'),
            announcement: t('Объявление','Билдирүү','Announcement'),
            result:       t('Результат','Натыйжа','Result')
        };
        const cat = catMap[n.category] || '';
        return `
            <a href="news.html?id=${encodeURIComponent(n.id)}" class="news-card scroll-reveal">
                <div class="news-card-img" style="background-image:url('${img}')">
                    <div class="news-img-overlay"></div>
                    ${cat ? `<span class="news-cat-badge">${cat}</span>` : ''}
                </div>
                <div class="news-card-body">
                    <h3 class="news-card-title">${title}</h3>
                    <p class="news-card-date">${date}</p>
                    <span class="news-read-link">${t('Читать →','Окуу →','Read more →')}</span>
                </div>
            </a>`;
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
    initHeroSlider();
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
        btn.addEventListener('click', () => { applyLang(btn.dataset.lang); closeLangDropdown(); });
    });

    const globeBtn  = document.getElementById('langGlobeBtn');
    const dropdown  = document.getElementById('langDropdown');
    if (globeBtn && dropdown) {
        globeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = dropdown.classList.toggle('lang-dropdown--open');
            globeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== globeBtn) closeLangDropdown();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLangDropdown();
        });
    }
}

function closeLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    const globeBtn  = document.getElementById('langGlobeBtn');
    if (dropdown) dropdown.classList.remove('lang-dropdown--open');
    if (globeBtn) globeBtn.setAttribute('aria-expanded', 'false');
}

function applyLang(lang, save) {
    if (save !== false) localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
    document.body.className = document.body.className.replace(/\blang-\w+\b/g, '').trim();
    document.body.classList.add('lang-' + lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
    });
    const globeCode = document.getElementById('langGlobeCode');
    if (globeCode) globeCode.textContent = lang.toUpperCase();
    // Update placeholders
    document.querySelectorAll('[data-ph-ru]').forEach(el => {
        if (lang === 'ky') el.placeholder = el.dataset.phKy || el.dataset.phRu;
        else if (lang === 'en') el.placeholder = el.dataset.phEn || el.dataset.phRu;
        else el.placeholder = el.dataset.phRu;
    });
    // Update select options
    document.querySelectorAll('option[data-ru]').forEach(el => {
        if (lang === 'ky') el.textContent = el.dataset.ky || el.dataset.ru;
        else if (lang === 'en') el.textContent = el.dataset.en || el.dataset.ru;
        else el.textContent = el.dataset.ru;
    });
    // Re-render hero panel in new language
    if (heroSlides.length) buildHeroPanel(heroSlides[currentSlide]);
    // Re-render featured athletes in new language
    if (_homeAthletesList.length) renderAthletesFeature(false);
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
    const counters = document.querySelectorAll('.stat-item__number[data-target]:not([data-counted]), .hero-kpi-num[data-target]:not([data-counted])');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.setAttribute('data-counted', '1');
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const suffix = element.dataset.suffix;
    const duration = 2000;
    const start = performance.now();

    function formatNumber(num) {
        if (suffix !== undefined) return num.toLocaleString('ru-RU') + suffix;
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
        btn.textContent = t('Отправка...', 'Жиберилүүдө...', 'Sending...');

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
            btn.textContent = t('✓ Отправлено!', '✓ Жиберилди!', '✓ Sent!');
            btn.style.background = 'var(--color-accent-light, #2D6A4F)';
            form.reset();
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        } catch (err) {
            const prefix = t('Ошибка: ', 'Ката: ', 'Error: ');
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
        athlete: { ru: 'Спортсмен',  ky: 'Спортчу',         en: 'Athlete' },
        coach:   { ru: 'Тренер',     ky: 'Машыктыруучу',    en: 'Coach' },
        staff:   { ru: 'Сотрудник',  ky: 'Кызматкер',       en: 'Staff' }
    };

    grid.innerHTML = filtered.map(a => {
        const name       = escapeHtml(lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || ''));
        const sport      = escapeHtml(lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || ''));
        const title      = escapeHtml(lang === 'ky' ? (a.titleKy || a.titleRu || '') : (a.titleRu || a.titleKy || ''));
        const roleMeta   = roleMap[a.role] || { ru: '', ky: '' };
        const roleLabel  = escapeHtml(lang === 'ky' ? roleMeta.ky : lang === 'en' ? (roleMeta.en || roleMeta.ru) : roleMeta.ru);
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
        <article class="athlete-card" onclick="location.href='athletes.html?id=${escapeHtml(String(a.id))}'">
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
                    <span class="t-en">${isRetired ? 'Retired' : 'Active'}</span>
                </span>
            </div>
        </article>`;
    }).join('');
}

function _safeUrl(u) {
    if (!u) return '';
    try { const p = new URL(u); return (p.protocol === 'http:' || p.protocol === 'https:') ? p.href : ''; }
    catch { return ''; }
}

function _athleteSocialLinks(a) {
    const TG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;
    const IG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
    const YT = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    const FB = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    const links = [];
    const tg = _safeUrl(a.socialTelegram);
    const ig = _safeUrl(a.socialInstagram);
    const yt = _safeUrl(a.socialYoutube);
    const fb = _safeUrl(a.socialFacebook);
    if (tg) links.push(`<a href="${escapeHtml(tg)}" target="_blank" rel="noopener noreferrer" class="athlete-social-link" aria-label="Telegram">${TG}</a>`);
    if (ig) links.push(`<a href="${escapeHtml(ig)}" target="_blank" rel="noopener noreferrer" class="athlete-social-link" aria-label="Instagram">${IG}</a>`);
    if (yt) links.push(`<a href="${escapeHtml(yt)}" target="_blank" rel="noopener noreferrer" class="athlete-social-link" aria-label="YouTube">${YT}</a>`);
    if (fb) links.push(`<a href="${escapeHtml(fb)}" target="_blank" rel="noopener noreferrer" class="athlete-social-link" aria-label="Facebook">${FB}</a>`);
    return links.length ? `<div class="athlete-detail__socials">${links.join('')}</div>` : '';
}

function showAthleteDetailPage(id) {
    const toolbar = document.querySelector('.athletes-toolbar');
    if (toolbar) toolbar.hidden = true;
    const tabs = document.getElementById('athleteTabs');
    if (tabs) tabs.hidden = true;
    const grid = document.getElementById('athletesGrid');
    if (grid) grid.innerHTML = '<div class="athlete-skeleton" style="grid-column:1/-1;height:300px"></div>';

    const lang = localStorage.getItem('site-lang') || 'ru';
    fetch('/api/people/' + encodeURIComponent(id))
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(a => renderAthleteDetail(a))
        .catch(() => {
            const backLabel = t('← Назад к спортсменам', '← Артка', '← Back to Athletes');
            const notFound  = t('Спортсмен не найден', 'Спортчу табылган жок', 'Athlete not found');
            if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0">
                <p style="opacity:.6;margin-bottom:1.5rem">${notFound}</p>
                <a href="athletes.html" class="news-back-btn">${backLabel}</a></div>`;
        });
}

function renderAthleteDetail(a) {
    const lang = localStorage.getItem('site-lang') || 'ru';
    const name  = lang === 'ky' ? (a.nameKy  || a.nameRu  || '') : (a.nameRu  || a.nameKy  || '');
    const sport = lang === 'ky' ? (a.sportKy || a.sportRu || '') : (a.sportRu || a.sportKy || '');
    const title = lang === 'ky' ? (a.titleKy || a.titleRu || '') : (a.titleRu || a.titleKy || '');
    const bio   = lang === 'ky' ? (a.bioKy || a.bioRu || '') : (a.bioRu || a.bioKy || '');
    const isRetired = a.careerStatus === 'retired';
    const achievements = (lang === 'ky' ? a.achievementsKy : a.achievementsRu) || [];
    const achArr = Array.isArray(achievements) ? achievements : [];
    const statusLabel = isRetired
        ? t('В отставке', 'Зейнеткерде', 'Retired')
        : t('Действующий', 'Активдүү', 'Active');
    const initials = escapeHtml(name).split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
    const photoHtml = a.photo
        ? `<img src="${escapeHtml(a.photo)}" alt="${escapeHtml(name)}"
               onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="athlete-initials" style="display:none">${initials}</div>`
        : `<div class="athlete-initials">${initials}</div>`;

    document.title = (name ? name + ' — ' : '') + 'Спортсмены — Дирекция национальных видов спорта';
    const backLabel = t('← Назад к спортсменам', '← Спортчуларга кайтуу', '← Back to Athletes');
    const phEl = document.querySelector('.page-header__title');
    if (phEl) phEl.innerHTML = `<a href="athletes.html" class="news-back-btn">${backLabel}</a>`;
    const phSub = document.querySelector('.page-header__subtitle');
    if (phSub) phSub.hidden = true;

    const grid = document.getElementById('athletesGrid');
    if (!grid) return;
    grid.innerHTML = `<div class="athlete-detail-page" style="grid-column:1/-1">
        <div class="athlete-detail__header">
            <div class="athlete-detail__photo-wrap">${photoHtml}</div>
            <div class="athlete-detail__info">
                <h1 class="athlete-detail__name">${escapeHtml(name)}</h1>
                ${sport ? `<p class="athlete-detail__sport">${escapeHtml(sport)}</p>` : ''}
                ${title ? `<p class="athlete-detail__title">${escapeHtml(title)}</p>` : ''}
                <span class="athlete-detail__status${isRetired ? ' athlete-detail__status--retired' : ''}">${statusLabel}</span>
                ${_athleteSocialLinks(a)}
            </div>
        </div>
        ${bio ? `<div class="athlete-detail__section">
            <div class="athlete-detail__section-title">${t('Биография','Өмүр баяны','Biography')}</div>
            <p class="athlete-detail__bio">${escapeHtml(bio)}</p>
        </div>` : ''}
        ${achArr.length ? `<div class="athlete-detail__section">
            <div class="athlete-detail__section-title">${t('Достижения','Жетишкендиктер','Achievements')}</div>
            <ul class="athlete-detail__achievements">${achArr.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}</ul>
        </div>` : ''}
        ${!bio && !achArr.length ? `<p style="opacity:.5;text-align:center;padding:40px 0">${t('Информация не добавлена','Маалымат жок','No information added')}</p>` : ''}
    </div>`;
}

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
    document.addEventListener('DOMContentLoaded', function() {
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('id');
        const urlSport = params.get('sport');
        if (urlId) {
            showAthleteDetailPage(urlId);
        } else if (urlSport) {
            activeSportFilter = decodeURIComponent(urlSport);
            showSportAthletes(activeSportFilter);
        } else {
            showSportCategories();
        }
    });
}

async function showSportCategories() {
    const toolbar = document.querySelector('.athletes-toolbar');
    if (toolbar) toolbar.hidden = true;
    const tabs = document.getElementById('athleteTabs');
    if (tabs) tabs.hidden = true;
    const grid = document.getElementById('athletesGrid');
    const empty = document.getElementById('athletesEmpty');
    if (empty) empty.classList.add('hidden');

    const phTitle = document.querySelector('.page-header__title');
    if (phTitle) phTitle.innerHTML = '<span class="t-ru">Виды спорта</span><span class="t-ky">Спорт түрлөрү</span><span class="t-en">Sports</span>';
    const phSub = document.querySelector('.page-header__subtitle');
    if (phSub) {
        phSub.innerHTML = '<span class="t-ru">Выберите вид спорта, чтобы увидеть спортсменов</span><span class="t-ky">Спортчуларды көрүү үчүн спорт түрүн тандаңыз</span><span class="t-en">Choose a sport to see its athletes</span>';
    }

    if (grid) grid.innerHTML = '<div class="sport-cat-grid" id="sportCatGrid"><div class="athlete-skeleton"></div><div class="athlete-skeleton"></div><div class="athlete-skeleton"></div><div class="athlete-skeleton"></div><div class="athlete-skeleton"></div><div class="athlete-skeleton"></div></div>';

    let sports = [];
    try {
        const r = await fetch('/api/sports?status=published&limit=50');
        const d = await r.json();
        sports = Array.isArray(d) ? d : (d.data || []);
    } catch (e) { sports = []; }

    const lang = localStorage.getItem('site-lang') || 'ru';
    const ICONS = typeof SPORT_ICONS_BY_ID !== 'undefined' ? SPORT_ICONS_BY_ID : {};

    if (grid) grid.innerHTML = '<div class="sport-cat-grid" id="sportCatGrid">'
        + sports.map(s => {
            const name = escapeHtml(lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu);
            const iconHtml = s.icon
                ? `<img src="${escapeHtml(s.icon)}" alt="${name}">`
                : (ICONS[String(s.id)] || ICONS['default'] || '');
            const count = s.athletesCount || 0;
            const countLabel = lang === 'ky' ? 'спортчу' : lang === 'en' ? 'athletes' : 'спортсменов';
            const coverStyle = s.image ? `style="background-image:url('${escapeHtml(s.image)}')"` : '';
            return `<div class="sport-cat-card" onclick="location.href='athletes.html?sport=${encodeURIComponent(s.nameRu)}'">
                <div class="sport-cat-cover" ${coverStyle}>
                    <div class="sport-cat-icon">${iconHtml}</div>
                </div>
                <div class="sport-cat-body">
                    <h3 class="sport-cat-name">${name}</h3>
                    ${count ? `<p class="sport-cat-count">${Number(count)} ${countLabel}</p>` : ''}
                </div>
            </div>`;
        }).join('')
        + '</div>';
}

async function showSportAthletes(sportName) {
    const phTitle = document.querySelector('.page-header__title');
    if (phTitle) phTitle.innerHTML = '<a href="athletes.html" class="news-back-btn">← <span class="t-ru">Все виды спорта</span><span class="t-ky">Бардык спорт түрлөрү</span><span class="t-en">All Sports</span></a>';

    try {
        const r = await fetch('/api/people');
        const d = await r.json();
        allAthletes = Array.isArray(d) ? d : (d.data || []);
    } catch (e) { allAthletes = []; }

    activeSportFilter = sportName;
    const toolbar = document.querySelector('.athletes-toolbar');
    if (toolbar) toolbar.hidden = true;
    const tabs = document.getElementById('athleteTabs');
    if (tabs) tabs.hidden = true;
    renderAthletes();
}

/* ── Athlete placeholder SVG — Kyrgyz ornamental frame with detailed figure ── */
const ATHLETE_PLACEHOLDER_SVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="80" height="80" fill="#C8963E"/>
  <path d="M0,0L80,0L80,13L76,18L72,13L68,18L64,13L60,18L56,13L52,18L48,13L44,18L40,13L36,18L32,13L28,18L24,13L20,18L16,13L12,18L8,13L4,18L0,13Z" fill="#2D6B18"/>
  <path d="M0,80L80,80L80,67L76,62L72,67L68,62L64,67L60,62L56,67L52,62L48,67L44,62L40,67L36,62L32,67L28,62L24,67L20,62L16,67L12,62L8,67L4,62L0,67Z" fill="#2D6B18"/>
  <circle cx="40" cy="27" r="8.5" fill="none" stroke="#C8963E" stroke-width="1.3" opacity="0.75"/>
  <circle cx="40" cy="27" r="5.8" fill="#2D6B18"/>
  <path d="M33,33 Q29,36 29,42 L30,47 Q34,51 40,51 Q46,51 50,47 L51,42 Q51,36 47,33 Q44,31.5 40,31.5 Q36,31.5 33,33Z" fill="#2D6B18"/>
  <line x1="29" y1="36" x2="17" y2="31" stroke="#2D6B18" stroke-width="3.8" stroke-linecap="round"/>
  <line x1="17" y1="31" x2="14" y2="39" stroke="#2D6B18" stroke-width="3.2" stroke-linecap="round"/>
  <line x1="14" y1="39" x2="12" y2="45" stroke="#2D6B18" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="51" y1="36" x2="63" y2="31" stroke="#2D6B18" stroke-width="3.8" stroke-linecap="round"/>
  <line x1="63" y1="31" x2="66" y2="39" stroke="#2D6B18" stroke-width="3.2" stroke-linecap="round"/>
  <line x1="66" y1="39" x2="68" y2="45" stroke="#2D6B18" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="36" y1="51" x2="31" y2="62" stroke="#2D6B18" stroke-width="3.8" stroke-linecap="round"/>
  <line x1="31" y1="62" x2="27" y2="65" stroke="#2D6B18" stroke-width="3.2" stroke-linecap="round"/>
  <line x1="44" y1="51" x2="49" y2="62" stroke="#2D6B18" stroke-width="3.8" stroke-linecap="round"/>
  <line x1="49" y1="62" x2="53" y2="65" stroke="#2D6B18" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M30,43 Q40,48 50,43" stroke="#C8963E" stroke-width="2.3" fill="none" stroke-linecap="round"/>
  <circle cx="40" cy="25.5" r="2.2" fill="#C8963E" opacity="0.85"/>
  <polygon points="36,18.5 40,15 44,18.5 40,22" fill="#C8963E" opacity="0.6"/>
</svg>`;

/* ── Home Athletes Spotlight — asymmetric featured layout ── */
var _homeAthletesList = [];
var _homeAthleteActiveIdx = 0;

function _athleteField(a, base) {
    const lang = localStorage.getItem('site-lang') || 'ru';
    return lang === 'ky' ? (a[base + 'Ky'] || a[base + 'Ru'] || '') : (a[base + 'Ru'] || a[base + 'Ky'] || '');
}

async function loadHomeAthletes() {
    const section = document.getElementById('athletesFeature');
    if (!section) return;
    try {
        const r = await fetch('/api/people');
        const d = await r.json();
        const athletes = (Array.isArray(d) ? d : (d.data || []))
            .filter(a => (!a.status || a.status === 'published') && a.role === 'athlete')
            .sort((a, b) => (parseInt(a.order) || 99) - (parseInt(b.order) || 99))
            .slice(0, 5);
        if (!athletes.length) { section.remove(); return; }
        _homeAthletesList = athletes;
        _homeAthleteActiveIdx = 0;
        renderAthletesFeature(false);
        section.style.display = '';
    } catch {
        section.remove();
    }
}
document.addEventListener('DOMContentLoaded', loadHomeAthletes);

function _athletesFeatureSpotlightHTML(a) {
    const name  = escapeHtml(_athleteField(a, 'name'));
    const title = escapeHtml(_athleteField(a, 'title') || _athleteField(a, 'sport'));
    const photoHtml = a.photo
        ? `<img class="athletes-feature__photo" src="${escapeHtml(a.photo)}" alt="${name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
    const svgStyle = a.photo ? 'display:none' : 'display:flex';
    return `<div class="athletes-feature__photo-wrap">
            ${photoHtml}
            <div class="athletes-feature__svg-wrap" style="${svgStyle}">${ATHLETE_PLACEHOLDER_SVG}</div>
        </div>
        <div class="athletes-feature__glass">
            <div class="athletes-feature__glass-name">${name}</div>
            <div class="athletes-feature__glass-title">${title}</div>
            <a href="athletes.html?id=${encodeURIComponent(a.id)}" class="athletes-feature__glass-link">
                <span class="t-ru">Профиль спортсмена</span><span class="t-ky">Спортчунун профили</span><span class="t-en">Athlete profile</span>
                <span class="athletes-feature__glass-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
            </a>
        </div>`;
}

function renderAthletesFeature(animate) {
    const listEl = document.getElementById('athletesFeatureList');
    const spotlightEl = document.getElementById('athletesFeatureSpotlight');
    if (!listEl || !spotlightEl) return;

    const active = _homeAthletesList[_homeAthleteActiveIdx];
    const rest = _homeAthletesList.filter((_, i) => i !== _homeAthleteActiveIdx);

    listEl.innerHTML = rest.map((a, i) => {
        const idx = _homeAthletesList.indexOf(a);
        const name  = escapeHtml(_athleteField(a, 'name'));
        const title = escapeHtml(_athleteField(a, 'title') || _athleteField(a, 'sport'));
        const photoHtml = a.photo
            ? `<img class="athletes-feature__item-photo" src="${escapeHtml(a.photo)}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : '';
        const svgStyle = a.photo ? 'display:none' : 'display:flex';
        return `<button type="button" class="athletes-feature__item" data-idx="${idx}" style="animation-delay:${i * 0.06}s">
            <span class="athletes-feature__item-photo-wrap">
                ${photoHtml}
                <span class="athletes-feature__item-svg" style="${svgStyle}">${ATHLETE_PLACEHOLDER_SVG}</span>
            </span>
            <span class="athletes-feature__item-text">
                <span class="athletes-feature__item-name">${name}</span>
                <span class="athletes-feature__item-title">${title}</span>
            </span>
        </button>`;
    }).join('');

    listEl.querySelectorAll('.athletes-feature__item').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (idx === _homeAthleteActiveIdx) return;
            _homeAthleteActiveIdx = idx;
            renderAthletesFeature(true);
        });
    });

    if (!active) { spotlightEl.innerHTML = ''; return; }

    if (!animate) {
        spotlightEl.innerHTML = `<div class="athletes-feature__spotlight-inner athletes-feature__spotlight-inner--visible">${_athletesFeatureSpotlightHTML(active)}</div>`;
        return;
    }

    // Fade the current spotlight out, swap content, fade back in
    const current = spotlightEl.querySelector('.athletes-feature__spotlight-inner');
    if (current) current.classList.remove('athletes-feature__spotlight-inner--visible');
    setTimeout(() => {
        spotlightEl.innerHTML = `<div class="athletes-feature__spotlight-inner">${_athletesFeatureSpotlightHTML(active)}</div>`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const inner = spotlightEl.querySelector('.athletes-feature__spotlight-inner');
                if (inner) inner.classList.add('athletes-feature__spotlight-inner--visible');
            });
        });
    }, 260);
}

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
            const svgFallback = SPORT_ICONS_BY_ID[String(s.id)] || SPORT_ICONS_BY_ID['default'];
            const iconHtml = s.icon
                ? `<img src="${escapeHtml(s.icon)}" alt="" style="width:80px;height:80px;object-fit:contain">`
                : svgFallback;
            return `<article class="sport-card sport-card--clickable" data-sport-home-idx="${i}" style="cursor:pointer">
                <div class="sport-card__icon" aria-hidden="true">${iconHtml}</div>
                <h3 class="sport-card__title"><span class="t-ru">${nameRu}</span><span class="t-ky">${nameKy}</span></h3>
                <p class="sport-card__text"><span class="t-ru">${descRu}…</span><span class="t-ky">${descKy}…</span></p>
                <span class="sport-card__link"><span class="t-ru">Подробнее →</span><span class="t-ky">Толугураак →</span></span>
            </article>`;
        }).join('');

        grid.addEventListener('click', e => {
            const card = e.target.closest('[data-sport-home-idx]');
            if (!card) return;
            const s = homeSportRegistry[Number(card.dataset.sportHomeIdx)];
            if (s) window.location.href = 'sport.html?id=' + encodeURIComponent(s.id);
        });
    } catch {
        grid.innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', loadHomeSports);

/* ── Live Stream on Home Page ── */
function _liveMiniThumb(thumbnailUrl, badgeHtml) {
    var icon = '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>';
    var bgStyle = thumbnailUrl ? "background-image:url('" + escapeHtml(thumbnailUrl) + "')" : '';
    var iconHtml = thumbnailUrl ? '' : '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#fff;opacity:.6">' + icon + '</span>';
    return '<div class="livestream-mini-card__thumb" style="' + bgStyle + '">' + badgeHtml + iconHtml + '</div>';
}

async function loadHomeLivestream() {
    var section = document.getElementById('livestreamSection');
    var container = document.getElementById('livestreamContainer');
    if (!section || !container) return;

    try {
        var r = await fetch('/api/livestreams?status=live&limit=1');
        var d = await r.json();
        var live = (d.data || []).find(function(s) { return s.status === 'live'; });

        var lang = localStorage.getItem('site-lang') || 'ru';

        if (!live) {
            // No live stream — check for a scheduled one tied to an upcoming event
            var r2 = await fetch('/api/livestreams?status=scheduled&limit=1');
            var d2 = await r2.json();
            var scheduled = (d2.data || []).find(function(s) { return s.status === 'scheduled'; });
            if (!scheduled) { section.style.display = 'none'; return; }

            var sTitle = lang === 'ky' ? (scheduled.titleKy || scheduled.titleRu) : (scheduled.titleRu || scheduled.titleKy);
            var whenLabel = lang === 'ky' ? 'Башталышы' : 'Начало';
            var when = scheduled.scheduledAt ? new Date(scheduled.scheduledAt).toLocaleString('ru-RU', {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}) : '';
            var scheduledBadge = '<span class="livestream-mini-card__badge livestream-mini-card__badge--scheduled">⏰ ' + (lang === 'ky' ? 'Күтүлүүдө' : 'Скоро') + '</span>';

            container.innerHTML = '<a href="livestreams.html" class="livestream-mini-card">'
                + _liveMiniThumb(scheduled.thumbnail, scheduledBadge)
                + '<div class="livestream-mini-card__body">'
                + '<h3 class="livestream-mini-card__title">' + escapeHtml(sTitle) + '</h3>'
                + (when ? '<p class="livestream-mini-card__desc">' + whenLabel + ': ' + escapeHtml(when) + '</p>' : '')
                + '</div></a>';
            section.style.display = '';
            return;
        }

        var title = lang === 'ky' ? (live.titleKy || live.titleRu) : (live.titleRu || live.titleKy);
        var desc  = lang === 'ky' ? (live.descriptionKy || live.descriptionRu) : (live.descriptionRu || live.descriptionKy);
        var liveBadge = '<span class="livestream-mini-card__badge">● LIVE</span>';

        container.innerHTML = '<a href="livestreams.html" class="livestream-mini-card">'
            + _liveMiniThumb(live.thumbnail, liveBadge)
            + '<div class="livestream-mini-card__body">'
            + '<h3 class="livestream-mini-card__title">' + escapeHtml(title) + '</h3>'
            + (desc ? '<p class="livestream-mini-card__desc">' + escapeHtml(desc.slice(0, 90)) + '</p>' : '')
            + '</div></a>';

        section.style.display = '';
    } catch (e) {}
}
document.addEventListener('DOMContentLoaded', loadHomeLivestream);

/* ── Visit Tracking ── */
(function trackVisit() {
    try {
        var path = window.location.pathname;
        if (!path || path === '/') path = '/index.html';
        // Normalize: add .html if missing for non-root paths
        if (path !== '/' && !path.endsWith('.html')) {
            // Check if it's a known route (like /athletes, /admin)
            // Only track public pages
        }
        // Send visit tracking — fire and forget, no error handling needed
        fetch('/api/stats/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: path })
        }).catch(function() {});
    } catch (e) {}
})();

/* ── Live Stream Nav Indicator ── */
async function checkLiveStreamStatus() {
    try {
        const r = await fetch('/api/livestreams?status=live&limit=1');
        const d = await r.json();
        const hasLive = (d.data || []).some(s => s.status === 'live');
        document.querySelectorAll('#navLiveDot').forEach(dot => {
            dot.classList.toggle('is-live', hasLive);
        });
        document.querySelectorAll('#navLiveStream').forEach(link => {
            link.classList.toggle('is-live', hasLive);
        });
    } catch (e) {}
}
document.addEventListener('DOMContentLoaded', checkLiveStreamStatus);

/* ── Dynamic footer contacts from settings ── */
(function loadFooterContacts() {
    fetch('/api/settings').then(function(r) { return r.json(); }).then(function(s) {
        var footerContacts = document.querySelectorAll('.footer__contacts li');
        if (!footerContacts.length) return;
        if (s.address && footerContacts[0]) {
            footerContacts[0].innerHTML = '📍 <span class="t-ru">' + (s.address.ru||'') + '</span><span class="t-ky">' + (s.address.ky||'') + '</span><span class="t-en">' + (s.address.ru||'') + '</span>';
        }
        if (s.phone && footerContacts[1]) footerContacts[1].innerHTML = '📞 ' + s.phone;
        if (s.email && footerContacts[2]) footerContacts[2].innerHTML = '✉️ ' + s.email;
    }).catch(function() {});
})();

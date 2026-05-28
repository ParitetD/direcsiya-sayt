/* ==========================================================================
   National Sports Website — Main JavaScript
   ========================================================================== */

/* ── Hero Slideshow with Typewriter effect ── */
(async function initHero() {
    let slides = [];
    try {
        const r = await fetch('/api/slides');
        const d = await r.json();
        slides = (Array.isArray(d) ? d : d.data || [])
            .filter(s => s.active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (e) {}

    if (!slides.length) {
        slides = [
            {
                image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=1600&q=80',
                titleRu: 'Дирекция национальных видов спорта Кыргызстана',
                titleKy: 'Кыргызстандын улуттук спорт түрлөрү боюнча дирекциясы',
                subtitleRu: 'Сохраняем и развиваем национальные спортивные традиции',
                subtitleKy: 'Улуттук спорт салттарын сактап жана өнүктүрөбүз'
            },
            {
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80',
                titleRu: 'Кыргызские спортсмены на мировой арене',
                titleKy: 'Кыргыз спортчулары дүйнөлүк аренада',
                subtitleRu: 'Наши атлеты представляют Кыргызстан на международных соревнованиях',
                subtitleKy: 'Биздин спортчулар Кыргызстанды намыс менен коргойт'
            },
            {
                image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1600&q=80',
                titleRu: 'Развитие спорта по всему Кыргызстану',
                titleKy: 'Бүткүл Кыргызстанда спортту өнүктүрүү',
                subtitleRu: 'Строим объекты и воспитываем чемпионов в каждом регионе',
                subtitleKy: 'Ар бир аймакта чемпиондорду даярдайбыз'
            }
        ];
    }

    const lang = localStorage.getItem('lang') || localStorage.getItem('site-lang') || 'ru';
    const container = document.getElementById('heroSlides');
    const dotsEl = document.getElementById('heroDots');
    if (!container) return;

    // Render slide backgrounds only (text is typed dynamically)
    container.innerHTML = slides.map((s, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}"
             style="background-image:url('${s.image}')">
            <div class="hero-overlay"></div>
        </div>
    `).join('');

    // Single shared content panel (not inside each slide)
    const heroSection = document.getElementById('hero') || container.parentElement;
    const panel = document.createElement('div');
    panel.className = 'hero-content';
    panel.innerHTML = `
        <img src="/logo.png" class="hero-logo" onerror="this.style.display='none'" alt="ДНВС">
        <h1 class="hero-title"><span id="_htxt"></span><span class="hero-cursor">|</span></h1>
        <p class="hero-sub" id="_hsub"></p>
        <div class="hero-btns" id="_hbtns" style="opacity:0">
            <a href="/sports" class="btn-hero-primary">${lang === 'ky' ? 'Спорт түрлөрү' : 'Виды спорта'}</a>
            <a href="/news" class="btn-hero-outline">${lang === 'ky' ? 'Жаңылыктар' : 'Новости'}</a>
        </div>
    `;
    heroSection.appendChild(panel);

    if (dotsEl) {
        dotsEl.innerHTML = slides.map((_, i) =>
            `<span class="hero-dot ${i === 0 ? 'active' : ''}" onclick="goSlide(${i})"></span>`
        ).join('');
    }

    // Helpers
    const wait = ms => new Promise(r => setTimeout(r, ms));

    function typeText(el, text, speed) {
        return new Promise(resolve => {
            el.textContent = '';
            let i = 0;
            (function tick() {
                if (i < text.length) {
                    el.textContent += text[i++];
                    setTimeout(tick, speed);
                } else {
                    resolve();
                }
            })();
        });
    }

    let cur = 0;
    let skip = false;

    async function runSlide(index) {
        cur = index;
        skip = false;

        const allSlides = container.querySelectorAll('.hero-slide');
        const allDots   = dotsEl ? dotsEl.querySelectorAll('.hero-dot') : [];

        const s         = slides[index];
        const titleText = lang === 'ky' ? (s.titleKy    || s.titleRu    || '') : (s.titleRu    || s.titleKy    || '');
        const subText   = lang === 'ky' ? (s.subtitleKy || s.subtitleRu || '') : (s.subtitleRu || s.subtitleKy || '');

        const titleEl = document.getElementById('_htxt');
        const subEl   = document.getElementById('_hsub');
        const btnsEl  = document.getElementById('_hbtns');
        const panel   = document.querySelector('.hero-content');

        // ── Phase 1: fade out entire panel as one piece ──
        panel.style.transition = 'opacity 0.7s ease';
        panel.style.opacity    = '0';

        // Switch background during the fade (crossfade happens simultaneously)
        allSlides.forEach((el, i) => el.classList.toggle('active', i === index));
        allDots.forEach((d, i)   => d.classList.toggle('active', i === index));

        await wait(720);
        if (skip) return;

        // Reset content while panel is invisible
        titleEl.textContent  = '';
        subEl.textContent    = '';
        btnsEl.style.opacity = '0';

        // ── Phase 2: fade panel back in ──
        panel.style.opacity = '1';
        await wait(380);
        if (skip) return;

        // Type title
        await typeText(titleEl, titleText, 40);
        if (skip) return;

        await wait(220);
        if (skip) return;

        // Type subtitle
        await typeText(subEl, subText, 30);
        if (skip) return;

        // Slide buttons in — they stay until the next cycle's fade-out
        btnsEl.style.transition = 'opacity 0.6s ease';
        btnsEl.style.opacity    = '1';

        // Hold for reading
        await wait(3800);
        if (skip) return;

        runSlide((index + 1) % slides.length);
    }

    // Manual dot nav — panel fades out cleanly at the top of the next runSlide
    window.goSlide = function (n) {
        const panel = document.querySelector('.hero-content');
        if (panel) { panel.style.transition = 'opacity 0.35s ease'; panel.style.opacity = '0'; }
        skip = true;
        setTimeout(() => runSlide(n), 360);
    };

    runSlide(0);
})();

/* ── Sports Icons ── */
const SPORT_ICONS = {
    'Бокс': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><rect x="26" y="34" width="28" height="20" rx="10" fill="#1B3B7D"/><rect x="30" y="22" width="20" height="16" rx="8" fill="#2952A3"/><rect x="36" y="22" width="8" height="6" rx="3" fill="#1B3B7D"/></svg>',
    'Борьба': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="28" cy="30" r="8" fill="#1B3B7D"/><circle cx="52" cy="30" r="8" fill="#2952A3"/><path d="M28 38 Q40 54 52 38" stroke="#1B3B7D" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="28" y1="38" x2="52" y2="38" stroke="#2952A3" stroke-width="3"/></svg>',
    'Тяжёлая атлетика': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><rect x="36" y="30" width="8" height="24" rx="2" fill="#1B3B7D"/><rect x="14" y="28" width="14" height="28" rx="5" fill="#2952A3"/><rect x="52" y="28" width="14" height="28" rx="5" fill="#2952A3"/><rect x="10" y="34" width="60" height="10" rx="5" fill="#1B3B7D"/></svg>',
    'Дзюдо': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="40" cy="24" r="8" fill="#1B3B7D"/><path d="M24 36 L40 30 L56 36 L56 58 L24 58 Z" fill="#2952A3"/><line x1="24" y1="46" x2="56" y2="46" stroke="white" stroke-width="2.5"/><line x1="40" y1="30" x2="40" y2="58" stroke="white" stroke-width="2"/></svg>',
    'Велоспорт': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="24" cy="50" r="12" stroke="#1B3B7D" stroke-width="3.5" fill="none"/><circle cx="56" cy="50" r="12" stroke="#1B3B7D" stroke-width="3.5" fill="none"/><path d="M24 50 L40 28 L56 50" stroke="#2952A3" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="40" cy="28" r="4" fill="#1B3B7D"/></svg>',
    'Стрельба из лука': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><path d="M24 14 Q14 40 24 66" stroke="#1B3B7D" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="24" y1="14" x2="24" y2="66" stroke="#2952A3" stroke-width="2.5"/><line x1="20" y1="40" x2="66" y2="40" stroke="#1B3B7D" stroke-width="2.5"/><polygon points="66,34 66,46 76,40" fill="#1B3B7D"/></svg>',
    'Плавание': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="40" cy="24" r="7" fill="#1B3B7D"/><path d="M28 34 Q40 28 52 34 L52 48 L28 48 Z" fill="#2952A3"/><path d="M14 56 Q24 48 34 56 Q44 64 54 56 Q64 48 74 56" stroke="#1B3B7D" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M14 62 Q24 54 34 62 Q44 70 54 62 Q64 54 74 62" stroke="#2952A3" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
    'Футбол': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="40" cy="40" r="22" stroke="#1B3B7D" stroke-width="3" fill="none"/><polygon points="40,20 46,32 34,32" fill="#1B3B7D"/><polygon points="58,50 46,44 50,32" fill="#1B3B7D"/><polygon points="50,64 42,54 54,50" fill="#1B3B7D"/><polygon points="30,64 38,54 26,50" fill="#1B3B7D"/><polygon points="22,50 34,44 30,32" fill="#1B3B7D"/></svg>',
    'default': '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="38" fill="#EEF2FF"/><circle cx="40" cy="40" r="18" stroke="#1B3B7D" stroke-width="3" fill="none"/><circle cx="40" cy="40" r="7" fill="#1B3B7D"/></svg>'
};

/* ── Sports Ticker ── */
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

    const lang = localStorage.getItem('lang') || localStorage.getItem('site-lang') || 'ru';

    function makeCard(s) {
        const name = lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu;
        const icon = SPORT_ICONS[s.nameRu] || SPORT_ICONS['default'];
        const data = encodeURIComponent(JSON.stringify(s));
        return `<div class="ticker-card"
            onclick="openSportModal('${data}')"
            onmouseenter="document.getElementById('tickerTrack').style.animationPlayState='paused'"
            onmouseleave="document.getElementById('tickerTrack').style.animationPlayState='running'">
            <div class="ticker-icon">${icon}</div>
            <span class="ticker-name">${name}</span>
        </div>`;
    }

    const cards = sports.map(makeCard).join('');
    track.innerHTML = cards + cards;
})();

window.openSportModal = function (encoded) {
    const s = JSON.parse(decodeURIComponent(encoded));
    const lang = localStorage.getItem('lang') || localStorage.getItem('site-lang') || 'ru';
    const name = lang === 'ky' ? (s.nameKy || s.nameRu) : s.nameRu;
    const desc = lang === 'ky' ? (s.descriptionKy || s.descriptionRu) : s.descriptionRu;
    document.getElementById('modalIcon').innerHTML = SPORT_ICONS[s.nameRu] || SPORT_ICONS['default'];
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = desc || '';
    const extra = document.getElementById('modalExtra');
    const count = s.athletesCount || s.athleteCount;
    extra.innerHTML = count
        ? `<div class="modal-stat"><strong>${count}</strong><span>${lang === 'ky' ? 'спортчу' : 'спортсменов'}</span></div>`
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

    const lang = localStorage.getItem('lang') || localStorage.getItem('site-lang') || 'ru';
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
        const title = lang === 'ky' ? (n.titleKy || n.titleRu) : (n.titleRu || n.titleKy);
        const img = n.image || fallbackImg;
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
                    <h3 class="news-card-title">${title || ''}</h3>
                    <p class="news-card-date">${date}</p>
                    <a href="/news" class="news-read-link">${lang === 'ky' ? 'Окуу →' : 'Читать →'}</a>
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
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') window.closeSportModal && window.closeSportModal();
    });
});

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

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        let isValid = true;

        formData.forEach((value, key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.hasAttribute('required') && !value.trim()) {
                input.style.borderColor = 'var(--color-primary)';
                isValid = false;
            } else if (input) {
                input.style.borderColor = '';
            }
        });

        if (isValid) {
            const btn = form.querySelector('.btn');
            const originalText = btn.textContent;
            btn.textContent = 'Отправлено!';
            btn.style.backgroundColor = 'var(--color-accent)';
            btn.style.borderColor = 'var(--color-accent)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                form.reset();
            }, 3000);
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

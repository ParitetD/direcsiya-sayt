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
        const icon = SPORT_ICONS[s.nameRu] || SPORT_ICONS['default'];
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
    document.getElementById('modalIcon').innerHTML = SPORT_ICONS[s.nameRu] || SPORT_ICONS['default'];
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
            btn.innerHTML = lang === 'ky'
                ? '<span class="t-ky">Ката: ' + err.message + '</span>'
                : '<span class="t-ru">Ошибка: ' + err.message + '</span>';
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

    container.innerHTML = chips.map(c => `
        <button class="sport-chip${activeSportFilter === c.val ? ' active' : ''}"
                onclick="filterBySport('${c.val.replace(/'/g, "\\'")}', this)">
            <span class="t-ru">${c.ru}</span>
            <span class="t-ky">${c.ky}</span>
        </button>
    `).join('');
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

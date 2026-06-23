/* ==========================================================================
   UX Enhancements — auto-inject on all pages
   scroll-to-top, cookie-banner, breadcrumbs, skip-link, footer icons
   ========================================================================== */

(function () {
    'use strict';

    const lang = localStorage.getItem('site-lang') || 'ru';

    /* ── 1. Skip Link ── */
    if (!document.querySelector('.skip-link')) {
        const skip = document.createElement('a');
        skip.href = '#main-content';
        skip.className = 'skip-link';
        skip.innerHTML = lang === 'ky'
            ? 'Негизги мазмунга өтүү'
            : 'Перейти к основному содержанию';
        document.body.prepend(skip);
    }

    /* ── 2. Main content anchor ── */
    const firstSection = document.querySelector('section.section, main, .section');
    if (firstSection && !document.getElementById('main-content')) {
        firstSection.id = 'main-content';
    }

    /* ── 3. Scroll to Top ── */
    let scrollBtn = document.getElementById('scrollTopBtn');
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-top';
        scrollBtn.id = 'scrollTopBtn';
        scrollBtn.setAttribute('aria-label', lang === 'ky' ? 'Жогору' : 'Наверх');
        scrollBtn.title = lang === 'ky' ? 'Жогору' : 'Наверх';
        scrollBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
        document.body.appendChild(scrollBtn);
    }
    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ── 4. Cookie Banner ── */
    if (!document.getElementById('cookieBanner') && !localStorage.getItem('cookie-accepted')) {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.id = 'cookieBanner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie');
        banner.innerHTML = '<div class="cookie-banner__inner">'
            + '<p>' + (lang === 'ky'
                ? 'Сайттын ишин жакшыртуу үчүн cookie файлдарын колдонобуз. Сайтты улантуу менен, cookie колдонууга макулдугуңузду билдиресиз.'
                : 'Мы используем файлы cookie для улучшения работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie.') + '</p>'
            + '<button class="cookie-banner__btn" id="cookieAcceptBtn">'
            + (lang === 'ky' ? 'Кабыл алуу' : 'Принять')
            + '</button></div>';
        document.body.appendChild(banner);

        document.getElementById('cookieAcceptBtn').addEventListener('click', () => {
            banner.classList.add('hidden');
            localStorage.setItem('cookie-accepted', '1');
        });
    }

    /* ── 5. Breadcrumbs ── */
    const pageMap = {
        'sports.html':    { ru: 'Виды спорта',    ky: 'Спорт түрлөрү' },
        'events.html':    { ru: 'Мероприятия',    ky: 'Иш-чаралар' },
        'gallery.html':   { ru: 'Галерея',        ky: 'Галерея' },
        'news.html':      { ru: 'Новости',        ky: 'Жаңылыктар' },
        'about.html':     { ru: 'О нас',          ky: 'Биз жөнүндө' },
        'contacts.html':  { ru: 'Контакты',       ky: 'Байланыш' },
        'athletes.html':  { ru: 'Спортсмены',     ky: 'Спортчулар' },
    };

    // Handle server-routed pages like /athletes (no .html extension)
    const rawPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPage = rawPage === 'athletes' ? 'athletes.html' : rawPage;
    const pageInfo = pageMap[currentPage];

    if (pageInfo && !document.querySelector('.breadcrumbs')) {
        const bc = document.createElement('nav');
        bc.className = 'breadcrumbs';
        bc.setAttribute('aria-label', lang === 'ky' ? 'Навигация' : 'Навигация');
        const homeText = lang === 'ky' ? 'Башкы бет' : 'Главная';
        const currentText = lang === 'ky' ? pageInfo.ky : pageInfo.ru;
        bc.innerHTML = '<div class="container"><ol class="breadcrumbs__list">'
            + '<li><a href="index.html">' + homeText + '</a></li>'
            + '<li>' + currentText + '</li>'
            + '</ol></div>';

        // Insert after header
        const header = document.getElementById('header');
        if (header && header.nextElementSibling) {
            header.parentNode.insertBefore(bc, header.nextElementSibling);
        } else if (header) {
            header.parentNode.appendChild(bc);
        }
    }

    /* ── 6. Replace emoji in footer contacts ── */
    var pinSvg = '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    var phoneSvg = '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var mailSvg = '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';

    document.querySelectorAll('.footer__contacts li').forEach(li => {
        var html = li.innerHTML;
        li.innerHTML = html
            .replace(/^📍\s*/, pinSvg + ' ')
            .replace(/^📞\s*/, phoneSvg + ' ')
            .replace(/^✉️\s*/, mailSvg + ' ');
    });

    /* ── 7. Replace 📍 in event cards ── */
    var pinSvgSmall = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;flex-shrink:0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    document.querySelectorAll('.event-card__location').forEach(el => {
        if (el.textContent.includes('📍') || el.innerHTML.includes('📍')) {
            el.innerHTML = el.innerHTML.replace(/📍\s*/g, pinSvgSmall + ' ');
        }
    });

    /* ── 8. Fix dead social links — prevent click only while href is still "#" ── */
    document.querySelectorAll('.social-link').forEach(function(a) {
        a.addEventListener('click', function(e) {
            if (a.getAttribute('href') === '#') e.preventDefault();
        });
    });

    /* ── 9. Load social links & contacts from API ── */
    (function() {
        function setContactLi(li, svgNode, text) {
            while (li.firstChild) li.removeChild(li.firstChild);
            if (svgNode) li.appendChild(svgNode);
            li.appendChild(document.createTextNode(' ' + text));
        }
        fetch('/api/settings')
            .then(function(r) { return r.ok ? r.json() : null; })
            .then(function(s) {
                if (!s) return;
                // Update social link hrefs — only allow http/https schemes
                ['Telegram', 'Instagram', 'YouTube'].forEach(function(name) {
                    var url = s['social' + name];
                    if (!url) return;
                    try {
                        var u = new URL(url);
                        if (u.protocol !== 'https:' && u.protocol !== 'http:') return;
                        document.querySelectorAll('.social-link[aria-label="' + name + '"]').forEach(function(a) {
                            a.href = u.href;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                        });
                    } catch (e) {}
                });
                // Update footer contacts — preserve SVG icon, set text via DOM
                var lis = document.querySelectorAll('.footer__contacts li');
                if (lis[0] && s.address) {
                    var svg0 = lis[0].querySelector('svg');
                    while (lis[0].firstChild) lis[0].removeChild(lis[0].firstChild);
                    if (svg0) lis[0].appendChild(svg0);
                    lis[0].appendChild(document.createTextNode(' '));
                    var spRu = document.createElement('span'); spRu.className = 't-ru'; spRu.textContent = s.address.ru || '';
                    var spKy = document.createElement('span'); spKy.className = 't-ky'; spKy.textContent = s.address.ky || '';
                    lis[0].appendChild(spRu);
                    lis[0].appendChild(spKy);
                }
                if (lis[1] && s.phone) {
                    setContactLi(lis[1], lis[1].querySelector('svg'), s.phone);
                }
                if (lis[2] && s.email) {
                    setContactLi(lis[2], lis[2].querySelector('svg'), s.email);
                }
            })
            .catch(function() {});
    })();

    /* ── 10. Replace SVG placeholder logo in footer with real logo.png ── */
    var footerSvgLogo = document.querySelector('.footer__col--about .logo__icon');
    if (footerSvgLogo) {
        var realLogo = document.createElement('img');
        realLogo.src = '/logo.png';
        realLogo.alt = 'ДНВС';
        realLogo.className = 'footer-logo-img';
        realLogo.addEventListener('error', function() { this.style.display = 'none'; });
        footerSvgLogo.parentNode.replaceChild(realLogo, footerSvgLogo);
    }

    /* ── 11. Add canonical + theme-color if missing ── */
    if (!document.querySelector('link[rel="canonical"]')) {
        var canon = document.createElement('link');
        canon.rel = 'canonical';
        canon.href = window.location.origin + window.location.pathname;
        document.head.appendChild(canon);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
        var tc = document.createElement('meta');
        tc.name = 'theme-color';
        tc.content = '#8B2500';
        document.head.appendChild(tc);
    }

})();

/* --------------------------------------
   11. 3D Card Tilt Effect
   -------------------------------------- */
function init3dCardEffect() {
    const cards = document.querySelectorAll('.sport-card, .news-card, .event-card, .athlete-preview-card');

    cards.forEach(card => {
        const intensity = 8; // How much the card tilts. Higher is more.

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -intensity;
            const rotateY = ((x - centerX) / centerX) * intensity;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease-in-out';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-in-out';
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

document.addEventListener('DOMContentLoaded', init3dCardEffect);

/* --------------------------------------
   12. Scroll Reveal (IntersectionObserver)
   -------------------------------------- */
(function () {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('is-visible'));
        return;
    }

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const selectors = [
        '.news-card', '.sport-card', '.event-card', '.athlete-preview-card',
        '.cta-block', '.stat-item', '.footer__col'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
        el.classList.add('scroll-reveal');
        revealObserver.observe(el);
    });

    /* Stat counter pop */
    const statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number').forEach(function (el) {
        statObserver.observe(el);
    });
})();

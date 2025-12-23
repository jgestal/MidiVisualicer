/**
 * Midi Tab Pro - Landing Page Scripts
 */

(function () {
    'use strict';

    // ============================================
    // Header Scroll Effect
    // ============================================
    const header = document.querySelector('.header');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);

    // ============================================
    // Screenshot Carousel
    // ============================================
    class Carousel {
        constructor(element) {
            this.carousel = element;
            this.track = element.querySelector('.carousel-slides');
            this.slides = element.querySelectorAll('.carousel-slide');
            this.dots = element.querySelectorAll('.carousel-dot');
            this.prevBtn = element.querySelector('.carousel-arrow.prev');
            this.nextBtn = element.querySelector('.carousel-arrow.next');

            this.currentIndex = 0;
            this.slideCount = this.slides.length;
            this.autoplayInterval = null;
            this.autoplayDelay = 5000; // 5 seconds

            this.init();
        }

        init() {
            // Bind events
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prev());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.next());
            }

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goTo(index));
            });

            // Start autoplay
            this.startAutoplay();

            // Pause on hover
            this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoplay());

            // Touch support
            this.initTouch();
        }

        goTo(index) {
            if (index < 0) {
                index = this.slideCount - 1;
            } else if (index >= this.slideCount) {
                index = 0;
            }

            this.currentIndex = index;
            this.track.style.transform = `translateX(-${index * 100}%)`;

            // Update dots
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        next() {
            this.goTo(this.currentIndex + 1);
        }

        prev() {
            this.goTo(this.currentIndex - 1);
        }

        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => this.next(), this.autoplayDelay);
        }

        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        initTouch() {
            let startX = 0;
            let endX = 0;

            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });

            this.track.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
            }, { passive: true });
        }
    }

    // Initialize carousels
    document.querySelectorAll('.carousel').forEach(el => new Carousel(el));

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Intersection Observer for Animations
    // ============================================
    const animateOnScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.feature-card, .step, .export-card').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    };

    // Add animation styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    animateOnScroll();

    // ============================================
    // Internationalization (I18n)
    // ============================================
    class I18n {
        constructor() {
            this.currentLang = 'es'; // Default
            this.translations = {};
            this.languages = [
                { code: 'es', flag: '🇪🇸', name: 'Español' },
                { code: 'en', flag: '🇬🇧', name: 'English' },
                { code: 'pt', flag: '🇵🇹', name: 'Português' },
                { code: 'fr', flag: '🇫🇷', name: 'Français' },
                { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
                { code: 'it', flag: '🇮🇹', name: 'Italiano' },
                { code: 'zh', flag: '🇨🇳', name: '中文' },
                { code: 'ja', flag: '🇯🇵', name: '日本語' },
                { code: 'ru', flag: '🇷🇺', name: 'Русский' },
                { code: 'ko', flag: '🇰🇷', name: '한국어' },
                { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
                { code: 'ar', flag: '🇸🇦', name: 'العربية' },
                { code: 'bn', flag: '🇧🇩', name: 'বাংলা' }
            ];

            this.init();
        }

        async init() {
            // Detect language from browser or URL
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            const browserLang = navigator.language.split('-')[0];

            // Check if detected language is supported
            if (langParam && this.languages.some(l => l.code === langParam)) {
                this.currentLang = langParam;
            } else if (this.languages.some(l => l.code === browserLang)) {
                // For now stick to Spanish as default until other translations are ready
                // this.currentLang = browserLang; 
            }

            // Always load Spanish for now since it's the only one we have fully populated
            // In a real scenario, we would load `locales/${this.currentLang}.json`
            // But user said "Por ahora no traduzcas al resto... pon una banderita arriba"
            // So we'll just load ES for everything but update the flag UI

            await this.loadTranslations('es');
            this.updateUI();
            this.renderLanguageSelector();
        }

        async loadTranslations(lang) {
            try {
                const response = await fetch(`locales/${lang}.json`);
                this.translations = await response.json();
            } catch (error) {
                console.error(`Error loading translations for ${lang}:`, error);
            }
        }

        translate(key) {
            return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
        }

        updateUI() {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.translate(key);

                if (element.tagName === 'META') {
                    element.setAttribute('content', translation);
                    return;
                }

                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', translation);
                    } else {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            });

            // Update page title
            const title = this.translate('meta.title');
            if (title && title !== 'meta.title') document.title = title;
        }

        renderLanguageSelector() {
            const selector = document.querySelector('.language-selector');
            if (!selector) return;

            const currentLangObj = this.languages.find(l => l.code === this.currentLang) || this.languages[0];

            selector.innerHTML = `
                <button class="lang-btn" aria-label="Select Language">
                    <span class="lang-flag">${currentLangObj.flag}</span>
                    <span class="lang-code">${currentLangObj.code.toUpperCase()}</span>
                </button>
                <div class="lang-dropdown">
                    ${this.languages.map(lang => `
                        <button class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" data-lang="${lang.code}">
                            <span>${lang.flag}</span>
                            <span>${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            `;

            // Add event listeners
            selector.querySelectorAll('.lang-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const newLang = e.currentTarget.getAttribute('data-lang');
                    this.changeLanguage(newLang);
                });
            });
        }

        async changeLanguage(lang) {
            this.currentLang = lang;

            // For now, allow switching UI flag but keep Spanish content
            // In future: await this.loadTranslations(lang);

            // Re-render selector to show new current language
            this.renderLanguageSelector();

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
        }
    }

    // Initialize I18n
    new I18n();

    // ============================================
    // CTA Button Tracking (placeholder)
    // ============================================
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // Add your analytics tracking here
            console.log('CTA clicked:', this.textContent.trim());
        });
    });

})();

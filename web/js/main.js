/**
 * Midi Tab Pro - Landing Page Scripts
 * 
 * @description Main JavaScript for the landing page with:
 * - Smooth scroll effects
 * - Carousel with touch support
 * - Intersection Observer animations
 * - Internationalization (ES/EN)
 * - Performance optimizations
 * 
 * @architecture
 * - IIFE pattern for encapsulation
 * - Class-based components for reusability
 * - Event delegation where possible
 * - Passive event listeners for performance
 */

(function () {
    'use strict';

    // ============================================
    // Constants
    // ============================================

    const CONFIG = {
        SCROLL_THRESHOLD: 50,
        CAROUSEL_AUTOPLAY_DELAY: 5000,
        CAROUSEL_SWIPE_THRESHOLD: 50,
        ANIMATION_THRESHOLD: 0.1,
        ANIMATION_ROOT_MARGIN: '0px 0px -50px 0px',
        PARALLAX_SPEED: 0.5,
    };

    const SELECTORS = {
        HEADER: '.header',
        CAROUSEL: '.carousel',
        CAROUSEL_TRACK: '.carousel-slides',
        CAROUSEL_SLIDE: '.carousel-slide',
        CAROUSEL_DOT: '.carousel-dot',
        CAROUSEL_PREV: '.carousel-arrow.prev',
        CAROUSEL_NEXT: '.carousel-arrow.next',
        ANCHOR_LINK: 'a[href^="#"]',
        ANIMATE_ELEMENTS: '.feature-card, .step, .export-card, .tab-benefit, .speed-benefit',
        LANGUAGE_SELECTOR: '.language-selector',
        I18N_ELEMENT: '[data-i18n]',
        CTA_BUTTON: '.btn-primary',
        PARALLAX_SECTION: '.parallax-section',
        STORE_BUTTON: '.store-button',
    };

    const CSS_CLASSES = {
        SCROLLED: 'scrolled',
        ACTIVE: 'active',
        VISIBLE: 'visible',
        ANIMATE_ON_SCROLL: 'animate-on-scroll',
    };

    // ============================================
    // Utility Functions
    // ============================================

    /**
     * Debounce function for performance
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for scroll events
     */
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // Header Scroll Effect
    // ============================================

    class HeaderController {
        constructor() {
            this.header = document.querySelector(SELECTORS.HEADER);
            if (!this.header) return;

            this.handleScroll = throttle(this.onScroll.bind(this), 100);
            this.init();
        }

        init() {
            window.addEventListener('scroll', this.handleScroll, { passive: true });
            // Initial check
            this.onScroll();
        }

        onScroll() {
            const isScrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;
            this.header.classList.toggle(CSS_CLASSES.SCROLLED, isScrolled);
        }
    }

    // ============================================
    // Parallax Effect
    // ============================================

    class ParallaxController {
        constructor() {
            this.sections = document.querySelectorAll(SELECTORS.PARALLAX_SECTION);
            if (this.sections.length === 0) return;

            this.handleScroll = throttle(this.onScroll.bind(this), 16);
            this.init();
        }

        init() {
            window.addEventListener('scroll', this.handleScroll, { passive: true });
        }

        onScroll() {
            const scrollY = window.scrollY;

            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const offset = (scrollY - section.offsetTop) * CONFIG.PARALLAX_SPEED;
                    section.style.backgroundPositionY = `calc(50% + ${offset}px)`;
                }
            });
        }
    }

    // ============================================
    // Screenshot Carousel
    // ============================================

    class Carousel {
        constructor(element) {
            this.carousel = element;
            this.track = element.querySelector(SELECTORS.CAROUSEL_TRACK);
            this.slides = element.querySelectorAll(SELECTORS.CAROUSEL_SLIDE);
            this.dots = element.querySelectorAll(SELECTORS.CAROUSEL_DOT);
            this.prevBtn = element.querySelector(SELECTORS.CAROUSEL_PREV);
            this.nextBtn = element.querySelector(SELECTORS.CAROUSEL_NEXT);

            this.currentIndex = 0;
            this.slideCount = this.slides.length;
            this.autoplayInterval = null;

            if (this.slideCount > 0) {
                this.init();
            }
        }

        init() {
            // Bind events
            this.prevBtn?.addEventListener('click', () => this.prev());
            this.nextBtn?.addEventListener('click', () => this.next());

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goTo(index));
            });

            // Keyboard navigation
            this.carousel.addEventListener('keydown', this.handleKeyboard.bind(this));

            // Start autoplay
            this.startAutoplay();

            // Pause on hover/focus
            this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoplay());
            this.carousel.addEventListener('focusin', () => this.stopAutoplay());
            this.carousel.addEventListener('focusout', () => this.startAutoplay());

            // Touch support
            this.initTouch();
        }

        handleKeyboard(e) {
            switch (e.key) {
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        }

        goTo(index) {
            // Wrap around
            if (index < 0) {
                index = this.slideCount - 1;
            } else if (index >= this.slideCount) {
                index = 0;
            }

            this.currentIndex = index;
            this.track.style.transform = `translateX(-${index * 100}%)`;

            // Update dots
            this.dots.forEach((dot, i) => {
                dot.classList.toggle(CSS_CLASSES.ACTIVE, i === index);
                dot.setAttribute('aria-selected', i === index);
            });

            // Update ARIA
            this.slides.forEach((slide, i) => {
                slide.setAttribute('aria-hidden', i !== index);
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
            this.autoplayInterval = setInterval(
                () => this.next(),
                CONFIG.CAROUSEL_AUTOPLAY_DELAY
            );
        }

        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        initTouch() {
            let startX = 0;
            let startY = 0;
            let isDragging = false;

            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
            }, { passive: true });

            this.track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;

                // Prevent vertical scroll when swiping horizontally
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault();
                }
            }, { passive: false });

            this.track.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;

                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > CONFIG.CAROUSEL_SWIPE_THRESHOLD) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
            }, { passive: true });
        }
    }

    // ============================================
    // Scroll Animations
    // ============================================

    class ScrollAnimator {
        constructor() {
            this.init();
        }

        init() {
            // Add CSS for animations
            this.injectStyles();

            // Setup Intersection Observer
            const observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    threshold: CONFIG.ANIMATION_THRESHOLD,
                    rootMargin: CONFIG.ANIMATION_ROOT_MARGIN,
                }
            );

            document.querySelectorAll(SELECTORS.ANIMATE_ELEMENTS).forEach((el, index) => {
                el.classList.add(CSS_CLASSES.ANIMATE_ON_SCROLL);
                el.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(el);
            });
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CSS_CLASSES.VISIBLE);
                }
            });
        }

        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .${CSS_CLASSES.ANIMATE_ON_SCROLL} {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .${CSS_CLASSES.ANIMATE_ON_SCROLL}.${CSS_CLASSES.VISIBLE} {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================
    // Smooth Scroll
    // ============================================

    class SmoothScroll {
        constructor() {
            this.header = document.querySelector(SELECTORS.HEADER);
            this.init();
        }

        init() {
            document.querySelectorAll(SELECTORS.ANCHOR_LINK).forEach(anchor => {
                anchor.addEventListener('click', this.handleClick.bind(this));
            });
        }

        handleClick(e) {
            const href = e.currentTarget.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const headerHeight = this.header?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });

                // Update URL
                history.pushState(null, null, href);
            }
        }
    }

    // ============================================
    // Internationalization (I18n)
    // ============================================

    class I18n {
        constructor() {
            this.currentLang = 'es';
            this.translations = {};
            this.languages = [
                { code: 'es', flag: '🇪🇸', name: 'Español' },
                { code: 'en', flag: '🇬🇧', name: 'English' },
            ];

            this.init();
        }

        async init() {
            // Detect language from URL or browser
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            const browserLang = navigator.language.split('-')[0];

            if (langParam && this.languages.some(l => l.code === langParam)) {
                this.currentLang = langParam;
            } else if (this.languages.some(l => l.code === browserLang)) {
                this.currentLang = browserLang;
            }

            await this.loadTranslations(this.currentLang);
            this.updateUI();
            this.renderLanguageSelector();
        }

        async loadTranslations(lang) {
            try {
                const response = await fetch(`locales/${lang}.json`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                this.translations = await response.json();
            } catch (error) {
                console.warn(`Translations for '${lang}' not found, falling back to Spanish`);
                // Fallback to Spanish
                if (lang !== 'es') {
                    await this.loadTranslations('es');
                }
            }
        }

        translate(key) {
            return key.split('.').reduce((obj, k) => obj?.[k], this.translations) || key;
        }

        updateUI() {
            document.querySelectorAll(SELECTORS.I18N_ELEMENT).forEach(element => {
                const key = element.getAttribute('data-i18n');

                // Handle attribute translations [attr]key format
                if (key.startsWith('[')) {
                    const match = key.match(/\[(\w+)\](.+)/);
                    if (match) {
                        const [, attr, translationKey] = match;
                        element.setAttribute(attr, this.translate(translationKey));
                        return;
                    }
                }

                const translation = this.translate(key);

                // Handle different element types
                if (element.tagName === 'META') {
                    element.setAttribute('content', translation);
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
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
            if (title !== 'meta.title') {
                document.title = title;
            }

            // Update html lang attribute
            document.documentElement.lang = this.currentLang;
        }

        renderLanguageSelector() {
            const selector = document.querySelector(SELECTORS.LANGUAGE_SELECTOR);
            if (!selector) return;

            const currentLangObj = this.languages.find(l => l.code === this.currentLang) || this.languages[0];

            selector.innerHTML = `
                <button class="lang-btn" aria-label="Select Language" aria-haspopup="listbox">
                    <span class="lang-flag" aria-hidden="true">${currentLangObj.flag}</span>
                    <span class="lang-code">${currentLangObj.code.toUpperCase()}</span>
                </button>
                <div class="lang-dropdown" role="listbox" aria-label="Available languages">
                    ${this.languages.map(lang => `
                        <button 
                            class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" 
                            data-lang="${lang.code}"
                            role="option"
                            aria-selected="${lang.code === this.currentLang}"
                        >
                            <span aria-hidden="true">${lang.flag}</span>
                            <span>${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            `;

            // Event delegation for language options
            selector.addEventListener('click', async (e) => {
                const option = e.target.closest('.lang-option');
                if (option) {
                    const newLang = option.getAttribute('data-lang');
                    await this.changeLanguage(newLang);
                }
            });
        }

        async changeLanguage(lang) {
            if (lang === this.currentLang) return;

            this.currentLang = lang;
            await this.loadTranslations(lang);
            this.updateUI();
            this.renderLanguageSelector();

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
        }
    }

    // ============================================
    // Store Button Hover Effects
    // ============================================

    class StoreButtonEffects {
        constructor() {
            this.buttons = document.querySelectorAll(SELECTORS.STORE_BUTTON);
            this.init();
        }

        init() {
            this.buttons.forEach(button => {
                button.addEventListener('mouseenter', this.handleEnter.bind(this));
                button.addEventListener('mouseleave', this.handleLeave.bind(this));
            });
        }

        handleEnter(e) {
            const button = e.currentTarget;
            button.style.transform = 'translateY(-3px) scale(1.02)';
        }

        handleLeave(e) {
            const button = e.currentTarget;
            button.style.transform = '';
        }
    }

    // ============================================
    // Analytics (placeholder)
    // ============================================

    class Analytics {
        constructor() {
            this.init();
        }

        init() {
            // Track CTA buttons
            document.querySelectorAll(SELECTORS.CTA_BUTTON).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.trackEvent('CTA_Click', {
                        label: e.currentTarget.textContent.trim(),
                        href: e.currentTarget.href,
                    });
                });
            });

            // Track store buttons
            document.querySelectorAll(SELECTORS.STORE_BUTTON).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const isApple = btn.classList.contains('apple');
                    this.trackEvent('Store_Click', {
                        store: isApple ? 'App Store' : 'Microsoft Store',
                    });
                });
            });
        }

        trackEvent(eventName, data) {
            // Replace with your analytics implementation
            console.log(`[Analytics] ${eventName}:`, data);

            // Example: Google Analytics 4
            // gtag('event', eventName, data);
        }
    }

    // ============================================
    // Initialize All Modules
    // ============================================

    function init() {
        new HeaderController();
        new ParallaxController();
        new SmoothScroll();
        new ScrollAnimator();
        new StoreButtonEffects();
        new I18n();
        new Analytics();

        // Initialize carousels
        document.querySelectorAll(SELECTORS.CAROUSEL).forEach(el => new Carousel(el));

        console.log('🎸 Midi Tab Pro - Landing Page Initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

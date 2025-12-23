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
    // CTA Button Tracking (placeholder)
    // ============================================
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // Add your analytics tracking here
            console.log('CTA clicked:', this.textContent.trim());
        });
    });

})();

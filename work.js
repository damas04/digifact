/* WORK PAGE — cinematic motion + subtle canvas mesh (aligned with homepage) */
(function () {
    var canvas = document.getElementById('work-hero-canvas');
    var reducedMotion =
        typeof window.matchMedia !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- Lightweight abstract “mesh” canvas --- */
    if (canvas && typeof canvas.getContext !== 'undefined' && !reducedMotion) {
        var ctx = canvas.getContext('2d');
        var nodes = [];
        var NW = 0;
        var NH = 0;
        var theta = 0;
        var running = true;

        function resizeCanvas() {
            NW = canvas.clientWidth || window.innerWidth;
            NH = canvas.clientHeight || window.innerHeight;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = NW * dpr;
            canvas.height = NH * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initNodes();
        }

        function initNodes() {
            nodes = [];
            var count = Math.min(
                Math.floor((NW * NH) / 26000),
                48,
                Math.floor(NW / 28)
            );
            count = Math.max(count, 12);
            for (var i = 0; i < count; i++) {
                nodes.push({
                    ax: Math.random() * NW,
                    ay: Math.random() * NH,
                    z: Math.random(),
                    vz: 0.12 + Math.random() * 0.2,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, NW, NH);
            var cx = NW * 0.5;
            var cy = NH * 0.46;
            var cos = Math.cos(theta * 0.35);
            var sin = Math.sin(theta * 0.35);
            theta += 0.0022;

            var projected = [];

            nodes.forEach(function (n, i) {
                n.phase += n.vz * 0.01;
                n.ax += Math.sin(theta * 1.7 + i) * 0.25;
                n.ay += Math.cos(theta * 1.3 + i * 0.5) * 0.22;
                n.ax = (n.ax + NW) % NW;
                n.ay = (n.ay + NH) % NH;
                var x0 = (n.ax - cx) / NW;
                var y0 = (n.ay - cy) / NH;
                var zOffset = Math.sin(theta + n.z * Math.PI * 2) * 0.06;
                var x1 = x0 * cos - y0 * sin;
                var y1 = x0 * sin + y0 * cos;
                projected.push({
                    x: cx + x1 * NW * 0.92,
                    y: cy + y1 * NH * 0.75 + zOffset * NH,
                    z: n.z,
                });
            });

            ctx.lineWidth = 1;

            /* connections */
            for (var i = 0; i < projected.length; i++) {
                for (var j = i + 1; j < projected.length; j++) {
                    var dx = projected[i].x - projected[j].x;
                    var dy = projected[i].y - projected[j].y;
                    var d = dx * dx + dy * dy;
                    if (d < 9200) {
                        var a = Math.max(0, 1 - d / 9200) * 0.12;
                        ctx.strokeStyle =
                            'rgba(82, 109, 130, ' + (a + projected[i].z * 0.08) + ')';
                        ctx.beginPath();
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                        ctx.stroke();
                    }
                }
            }

            /* nodes */
            projected.forEach(function (p) {
                var r = 1.6 + p.z * 2.2;
                ctx.fillStyle = 'rgba(157, 178, 191, ' + (0.2 + p.z * 0.35) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle =
                    'rgba(0, 114, 255, ' + (0.06 + p.z * 0.08) + ')';
                ctx.stroke();
            });

            requestAnimationFrame(draw);
        }

        resizeCanvas();
        window.addEventListener('resize', function () {
            resizeCanvas();
        });
        requestAnimationFrame(draw);
    }

    var header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    });

    var burger = document.querySelector('.burger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var closeBtn = document.querySelector('.mobile-close');
    var mobileLinks = document.querySelectorAll('.mobile-menu-card a');

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (burger) {
        burger.addEventListener('click', openMobileMenu);
        burger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMobileMenu();
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
    mobileLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    document.querySelectorAll('[data-scroll-target="#work-cta"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-scroll-target');
            if (!id || id.charAt(0) !== '#') return;
            var target = document.querySelector(id);
            if (target) {
                closeMobileMenu();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) closeMobileMenu();
        });
    }

    /* --- GSAP --- */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return;

    /* Hero reveals */
    var heroContent = document.querySelector('.work-hero-content');
    if (heroContent) {
        gsap.from(heroContent.children, {
            y: 44,
            opacity: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.1,
        });
    }

    gsap.from('.work-scroll-hint', {
        opacity: 0,
        y: 12,
        duration: 0.85,
        delay: 1.05,
        ease: 'power2.out',
    });

    gsap.from('.work-hero-giant .bg-text', {
        opacity: 0,
        scale: 1.03,
        duration: 1.35,
        ease: 'power2.out',
    });

    gsap.to('.work-hero-giant .bg-text', {
        y: -120,
        ease: 'none',
        scrollTrigger: {
            trigger: '.work-hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
        },
    });

    gsap.to('.work-hero-canvas', {
        opacity: 0.22,
        y: 40,
        ease: 'none',
        scrollTrigger: {
            trigger: '.work-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
    });

    gsap.utils.toArray('.work-prestige-item').forEach(function (row, i) {
        gsap.from(row, {
            scrollTrigger: {
                trigger: '.work-prestige',
                start: 'top 88%',
                toggleActions: 'play none none reverse',
            },
            y: 24,
            opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
            delay: i * 0.08,
        });
    });

    /* Featured strips */
    document.querySelectorAll('.work-project').forEach(function (section, projIndex) {
        var wm = section.querySelector('.work-project-watermark .bg-text');
        if (wm) {
            gsap.to(wm, {
                y: -150,
                x: projIndex % 2 === 0 ? -22 : 22,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.15,
                },
            });
        }

        var media = section.querySelector('.work-project-media');
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 66%',
                toggleActions: 'play none none reverse',
            },
        });

        var clipStart =
            projIndex % 2 === 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)';
        tl.from(media, {
            clipPath: clipStart,
            duration: 1.28,
            ease: 'power4.inOut',
            onComplete: function () {
                gsap.set(media, { clipPath: 'none' });
            },
        }).from(
            section.querySelectorAll('.work-project-copy .main-heading'),
            {
                x: projIndex % 2 === 0 ? -56 : 56,
                y: 32,
                opacity: 0,
                duration: 0.94,
                ease: 'power3.out',
                clearProps: 'transform',
            },
            '-=0.62'
        )
            .from(
            section.querySelectorAll('.work-project-copy .description'),
                {
                    y: 24,
                    opacity: 0,
                    duration: 0.72,
                    ease: 'power2.out',
                },
                '-=0.52'
            )
            .from(
                section.querySelectorAll('.work-project-meta > div'),
                {
                    opacity: 0,
                    y: 16,
                    stagger: 0.12,
                    duration: 0.65,
                },
                '-=0.42'
            )
            .from(
                section.querySelectorAll('.work-project-copy .status-bar'),
                {
                    opacity: 0,
                    x: section.classList.contains('work-project--reverse') ? 24 : -24,
                    duration: 0.55,
                },
                '-=0.95'
            );

        gsap.from(section.querySelectorAll('.ui-element'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 66%',
            },
            scale: 0,
            opacity: 0,
            stagger: 0.14,
            duration: 0.55,
            ease: 'back.out(1.3)',
            delay: 0.55,
        });
    });

    gsap.utils.toArray('.work-project-img').forEach(function (img) {
        gsap.to(img, {
            scale: 1.12,
            y: '-4%',
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.work-project'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    });

    gsap.utils.toArray('.work-project .ui-element').forEach(function (el) {
        gsap.to(el, {
            y: 12,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 0.5,
        });
    });

    /* Industries */
    gsap.utils.toArray('.work-sector-card').forEach(function (card, i) {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
            },
            y: 58,
            opacity: 0,
            duration: 0.82,
            delay: i * 0.06,
            ease: 'power3.out',
        });
    });

    /* Process */
    var procAxis = document.querySelector('.work-timeline-axis');
    var procLine = document.querySelector('.work-timeline-line');
    if (procLine && procAxis) {
        gsap.from(procLine, {
            scaleY: 0,
            transformOrigin: 'top center',
            ease: 'none',
            scrollTrigger: {
                trigger: procAxis,
                start: 'top 74%',
                end: 'bottom 58%',
                scrub: 0.85,
            },
        });
    }

    gsap.utils.toArray('.work-timeline-item').forEach(function (item, i) {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
            },
            x: i % 2 === 0 ? -40 : 40,
            opacity: 0,
            duration: 0.78,
            delay: i * 0.045,
            ease: 'power3.out',
        });
    });

    /* Trust */
    gsap.utils.toArray('.work-logo-slot').forEach(function (slot, i) {
        gsap.from(slot, {
            scrollTrigger: {
                trigger: '.work-logo-row',
                start: 'top 86%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 20,
            duration: 0.55,
            delay: i * 0.05,
            ease: 'power2.out',
        });
    });

    gsap.utils.toArray('.work-metric').forEach(function (m, i) {
        gsap.from(m, {
            scrollTrigger: {
                trigger: '.work-metrics',
                start: 'top 86%',
                toggleActions: 'play none none reverse',
            },
            y: 32,
            opacity: 0,
            duration: 0.72,
            delay: i * 0.07,
            ease: 'power3.out',
        });
    });

    /* CEO */
    var ceoMark = document.querySelector('.work-ceo-watermark .bg-text');
    if (ceoMark) {
        gsap.to(ceoMark, {
            y: -90,
            ease: 'none',
            scrollTrigger: {
                trigger: '.work-ceo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.15,
            },
        });
    }

    gsap.from('.work-ceo-inner > *', {
        scrollTrigger: {
            trigger: '.work-ceo',
            start: 'top 72%',
        },
        y: 34,
        opacity: 0,
        stagger: 0.14,
        duration: 0.95,
        ease: 'power3.out',
    });

    /* CTA */
    gsap.fromTo(
        '.work-cta-glow',
        { opacity: 0.32, scale: 0.8 },
        {
            opacity: 1,
            scale: 1.06,
            ease: 'none',
            scrollTrigger: {
                trigger: '#work-cta',
                start: 'top 88%',
                end: 'top 32%',
                scrub: true,
            },
        }
    );

    gsap.from('#work-cta .cta-terminal', {
        scrollTrigger: {
            trigger: '#work-cta',
            start: 'top 82%',
        },
        opacity: 0,
        scale: 0.96,
        duration: 0.92,
        ease: 'power2.out',
    });

    gsap.from('.work-industries .section-title > *', {
        scrollTrigger: {
            trigger: '.work-industries',
            start: 'top 78%',
            toggleActions: 'play none none reverse',
        },
        y: 32,
        opacity: 0,
        stagger: 0.1,
        duration: 0.85,
        ease: 'power3.out',
    });

    gsap.from('.work-trust-inner', {
        scrollTrigger: {
            trigger: '.work-trust',
            start: 'top 82%',
            toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.92,
        ease: 'power3.out',
    });

    gsap.from('.footer', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 96%',
            end: 'top 78%',
            scrub: true,
        },
        y: 20,
        opacity: 0.88,
        ease: 'none',
    });

    gsap.utils.toArray('.work-cta-primary, .contact-bridge-primary').forEach(function (el) {
        if (!el) return;
        el.addEventListener('mouseenter', function () {
            gsap.to(el, { scale: 1.02, duration: 0.45, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', function () {
            gsap.to(el, { scale: 1, duration: 0.55, ease: 'power2.out' });
        });
    });
})();

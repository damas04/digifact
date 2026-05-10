/* ABOUT PAGE — immersive scroll + hero mesh + narrative motion */
(function () {
    var reducedMotion =
        typeof window.matchMedia !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- Hero mesh (2D lattice, same dialect as Contact/Work) --- */
    function initHeroMesh(canvas) {
        if (!canvas || !canvas.getContext || reducedMotion) return;
        var ctx = canvas.getContext('2d');
        var nodes = [];
        var NW = 0;
        var NH = 0;
        var theta = 0;
        var running = true;

        function resize() {
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
            var count = Math.min(Math.floor((NW * NH) / 27500), 46, Math.floor(NW / 26));
            count = Math.max(count, 14);
            for (var i = 0; i < count; i++) {
                nodes.push({
                    ax: Math.random() * NW,
                    ay: Math.random() * NH,
                    z: Math.random(),
                    vz: 0.09 + Math.random() * 0.18,
                });
            }
        }

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, NW, NH);
            var cx = NW * 0.5;
            var cy = NH * 0.48;
            theta += 0.00195;
            var cos = Math.cos(theta * 0.33);
            var sin = Math.sin(theta * 0.33);
            var projected = [];

            nodes.forEach(function (n, i) {
                n.ax += Math.sin(theta * 1.55 + i) * 0.22;
                n.ay += Math.cos(theta * 1.2 + i * 0.48) * 0.2;
                n.ax = (n.ax + NW) % NW;
                n.ay = (n.ay + NH) % NH;
                var x0 = (n.ax - cx) / NW;
                var y0 = (n.ay - cy) / NH;
                var zo = Math.sin(theta + n.z * Math.PI * 2) * 0.05;
                projected.push({
                    x: cx + (x0 * cos - y0 * sin) * NW * 0.93,
                    y: cy + (x0 * sin + y0 * cos) * NH * 0.76 + zo * NH,
                    z: n.z,
                });
            });

            for (var a = 0; a < projected.length; a++) {
                for (var b = a + 1; b < projected.length; b++) {
                    var dx = projected[a].x - projected[b].x;
                    var dy = projected[a].y - projected[b].y;
                    var d = dx * dx + dy * dy;
                    if (d < 9000) {
                        var alp = Math.max(0, 1 - d / 9000) * 0.11;
                        ctx.strokeStyle = 'rgba(82, 109, 130, ' + (alp + projected[a].z * 0.07) + ')';
                        ctx.beginPath();
                        ctx.moveTo(projected[a].x, projected[a].y);
                        ctx.lineTo(projected[b].x, projected[b].y);
                        ctx.stroke();
                    }
                }
            }

            projected.forEach(function (p) {
                var r = 1.4 + p.z * 2;
                ctx.fillStyle = 'rgba(157, 178, 191, ' + (0.18 + p.z * 0.32) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(draw);
    }

    initHeroMesh(document.getElementById('about-hero-canvas'));

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

    document.querySelectorAll('[data-scroll-target="#about-cta"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-scroll-target');
            if (!id || id.charAt(0) !== '#') return;
            var tgt = document.querySelector(id);
            if (tgt) {
                closeMobileMenu();
                tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) closeMobileMenu();
        });
    }

    /* Spotlight on mission cards */
    document.querySelectorAll('.about-mission-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty('--sx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        });
    });

    /* --- Manifesto word rhythm --- */
    var manifestoEl = document.querySelector('.about-manifesto-text');
    var savedManifestoWords = '';
    if (manifestoEl && typeof manifestoEl.textContent === 'string') {
        savedManifestoWords = manifestoEl.textContent.trim();
        if (!reducedMotion && savedManifestoWords) {
            manifestoEl.innerHTML = savedManifestoWords
                .split(/\s+/)
                .map(function (word) {
                    return '<span class="about-manifesto-word">' + word + '</span>';
                })
                .join(' ');
        }
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var heroCv = document.getElementById('about-hero-canvas');

    /* --- Reduced motion fallback: manifesto markup restore --- */
    if (reducedMotion) {
        if (manifestoEl && savedManifestoWords && manifestoEl.querySelector('.about-manifesto-word'))
            manifestoEl.textContent = savedManifestoWords;
        return;
    }

    if (heroCv) {
        gsap.to(heroCv, {
            opacity: 0.22,
            y: 32,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

    var heroContent = document.querySelector('.about-hero-content');
    if (heroContent) {
        gsap.from(heroContent.children, {
            y: 48,
            opacity: 0,
            duration: 1.22,
            stagger: 0.11,
            ease: 'power3.out',
            delay: 0.1,
        });
    }

    gsap.from('.about-hero-giant .bg-text', {
        opacity: 0,
        scale: 1.035,
        duration: 1.38,
        ease: 'power2.out',
    });

    gsap.from('.about-moon', {
        opacity: 0,
        y: 28,
        duration: 1.15,
        ease: 'power2.out',
        delay: 0.18,
    });

    gsap.to('.about-hero-giant .bg-text', {
        y: -150,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about-hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
        },
    });

    gsap.to('.about-hero-layers', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about-hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });

    var overview = document.querySelector('.about-overview');
    var ovGiant = overview ? overview.querySelector('.bg-text') : null;

    if (ovGiant) {
        gsap.to(ovGiant, {
            y: -170,
            ease: 'none',
            scrollTrigger: {
                trigger: overview,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4,
            },
        });
    }

    var ovFrame = document.querySelector('.about-overview .about-parallax-frame');
    if (ovFrame && overview) {
        gsap.to(ovFrame, {
            y: -32,
            scale: 1.03,
            ease: 'none',
            scrollTrigger: {
                trigger: overview,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

    if (overview) {
        var overviewTl = gsap.timeline({
            scrollTrigger: {
                trigger: overview,
                start: 'top 62%',
                toggleActions: 'play none none reverse',
            },
        });

        overviewTl.from('.about-overview-visual', {
            clipPath: 'inset(100% 0 0 0)',
            duration: 1.15,
            ease: 'power4.inOut',
        });
        overviewTl.from(
            '.about-overview-main .main-heading',
            { y: 76, opacity: 0, duration: 0.98, ease: 'power3.out' },
            '-=0.76'
        );
        overviewTl.from(
            '.about-overview-main .description',
            { opacity: 0, y: 22, stagger: 0.1, duration: 0.78 },
            '-=0.58'
        );
        overviewTl.from(
            '.about-overview-aside',
            { x: 52, opacity: 0, duration: 0.88, ease: 'power3.out' },
            '-=0.62'
        );
        overviewTl.from(
            '.about-pill-list li',
            { opacity: 0, y: 16, stagger: { each: 0.06 }, duration: 0.55 },
            '-=0.55'
        );
        overviewTl.from(
            '.about-overview-visual .ui-element',
            { scale: 0, opacity: 0, stagger: 0.15 },
            '-=0.48'
        );
    }

    gsap.utils.toArray('.about-overview-visual .ui-element').forEach(function (el) {
        gsap.to(el, {
            y: 14,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 0.4,
        });
    });

    gsap.utils.toArray('.about-mission-card').forEach(function (card, i) {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 86%',
                toggleActions: 'play none none reverse',
            },
            y: 64,
            opacity: 0,
            duration: 0.92,
            delay: i * 0.1,
            ease: 'power3.out',
        });
    });

    var axis = document.querySelector('.about-approach .about-timeline-axis');
    var line = document.querySelector('.about-approach .about-timeline-line');

    if (line && axis) {
        gsap.from(line, {
            scaleY: 0,
            transformOrigin: 'top center',
            ease: 'none',
            scrollTrigger: {
                trigger: axis,
                start: 'top 72%',
                end: 'bottom 55%',
                scrub: 0.9,
            },
        });
    }

    gsap.utils.toArray('.about-approach .about-timeline-item').forEach(function (item, i) {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 86%',
                toggleActions: 'play none none reverse',
            },
            x: i % 2 === 0 ? -48 : 48,
            opacity: 0,
            duration: 0.82,
            delay: i * 0.04,
            ease: 'power3.out',
        });
    });

    var exHead = document.querySelector('.about-expertise-head');
    if (exHead) {
        gsap.timeline({
            scrollTrigger: {
                trigger: '.about-expertise',
                start: 'top 74%',
                toggleActions: 'play none none reverse',
            },
        })
            .from('.about-ex-status', {
                opacity: 0,
                y: 20,
                duration: 0.75,
                ease: 'power2.out',
            })
            .from(
                '.about-ex-heading',
                { opacity: 0, y: 56, duration: 0.95, ease: 'power3.out' },
                '-=0.45'
            )
            .from(
                '.about-ex-tagline',
                { opacity: 0, y: 26, duration: 0.78, ease: 'power2.out' },
                '-=0.55'
            );
    }

    gsap.utils.toArray('.about-expertise .card-3d').forEach(function (card, i) {
        gsap.from(card, {
            scrollTrigger: {
                trigger: '.about-expertise',
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            y: 110,
            opacity: 0,
            duration: 0.95,
            ease: 'power4.out',
            delay: i * 0.07,
        });

        var inner = card.querySelector('.card-inner');
        if (!inner) return;

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var mx = e.clientX - rect.left - rect.width / 2;
            var my = e.clientY - rect.top - rect.height / 2;
            gsap.to(inner, {
                rotateY: -(mx / 14),
                rotateX: my / 14,
                duration: 0.45,
                ease: 'power2.out',
                transformPerspective: 1100,
            });
        });

        card.addEventListener('mouseleave', function () {
            gsap.to(inner, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.9,
                ease: 'elastic.out(1, 0.55)',
                transformPerspective: 1100,
            });
        });
    });

    var mvMark = document.querySelector('.about-manifesto-watermark .bg-text');
    if (mvMark) {
        gsap.to(mvMark, {
            y: -110,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about-manifesto',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.15,
            },
        });
    }

    var manifestST = {
        trigger: '.about-manifesto',
        start: 'top 72%',
        toggleActions: 'play none none reverse',
    };

    gsap.from('.about-manifesto-status', {
        scrollTrigger: manifestST,
        y: 38,
        opacity: 0,
        duration: 0.92,
        ease: 'power3.out',
    });

    if (manifestoEl && manifestoEl.querySelector('.about-manifesto-word')) {
        gsap.from('.about-manifesto-word', {
            scrollTrigger: manifestST,
            y: 14,
            opacity: 0,
            stagger: 0.045,
            duration: 0.58,
            ease: 'power2.out',
            delay: 0.12,
        });
    } else if (manifestoEl) {
        gsap.from('.about-manifesto-text', {
            scrollTrigger: manifestST,
            y: 28,
            opacity: 0,
            duration: 0.92,
            ease: 'power2.out',
        });
    }

    gsap.from('.about-manifesto-sig', {
        scrollTrigger: manifestST,
        opacity: 0,
        letterSpacing: '0.58em',
        duration: 1.08,
        ease: 'power3.out',
        delay: 0.55,
    });

    gsap.fromTo(
        '.about-cta-glow',
        { opacity: 0.26, scale: 0.8 },
        {
            opacity: 1,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
                trigger: '#about-cta',
                start: 'top 90%',
                end: 'top 28%',
                scrub: true,
            },
        }
    );

    gsap.from('#about-cta .cta-terminal', {
        scrollTrigger: {
            trigger: '#about-cta',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
        opacity: 0,
        scale: 0.94,
        duration: 1.05,
        ease: 'power3.out',
    });

    gsap.from('.footer', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 94%',
            end: 'top 78%',
            scrub: true,
        },
        y: 18,
        opacity: 0.85,
        ease: 'none',
    });
})();

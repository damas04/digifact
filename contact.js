/* CONTACT PAGE — canvases + GSAP (homepage / work motion language) */
(function () {
    function initMeshCanvas(canvas, options) {
        if (!canvas || !canvas.getContext) return null;
        var opts = options || {};
        var densityDiv = opts.densityDiv || 26000;
        var maxNodes = opts.maxNodes || 44;
        var minNodes = opts.minNodes || 14;
        var linkThreshold = opts.linkThreshold || 9200;
        var driftScale = opts.driftScale !== undefined ? opts.driftScale : 1;

        var ctx = canvas.getContext('2d');
        var nodes = [];
        var NW = 0;
        var NH = 0;
        var theta = 0;
        var running = true;

        function resize() {
            NW = canvas.clientWidth || canvas.parentElement.clientWidth || 400;
            NH = canvas.clientHeight || canvas.parentElement.clientHeight || 400;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = NW * dpr;
            canvas.height = NH * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initNodes();
        }

        function initNodes() {
            nodes = [];
            var count = Math.floor((NW * NH) / densityDiv);
            count = Math.min(Math.max(count, minNodes), maxNodes, Math.floor(NW / 24));
            for (var i = 0; i < count; i++) {
                nodes.push({
                    ax: Math.random() * NW,
                    ay: Math.random() * NH,
                    z: Math.random(),
                    vz: 0.1 + Math.random() * 0.22,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, NW, NH);
            var cx = NW * 0.5;
            var cy = NH * 0.48;
            var cos = Math.cos(theta * 0.32 * driftScale);
            var sin = Math.sin(theta * 0.32 * driftScale);
            theta += 0.002 * driftScale;

            var projected = [];
            nodes.forEach(function (n, i) {
                n.phase += n.vz * 0.01;
                n.ax += Math.sin(theta * 1.5 + i) * (0.18 * driftScale);
                n.ay += Math.cos(theta * 1.25 + i * 0.45) * (0.16 * driftScale);
                n.ax = (n.ax + NW) % NW;
                n.ay = (n.ay + NH) % NH;
                var x0 = (n.ax - cx) / NW;
                var y0 = (n.ay - cy) / NH;
                var zOff = Math.sin(theta + n.z * Math.PI * 2) * 0.055;
                var x1 = x0 * cos - y0 * sin;
                var y1 = x0 * sin + y0 * cos;
                projected.push({
                    x: cx + x1 * NW * (opts.scaleX !== undefined ? opts.scaleX : 0.94),
                    y: cy + y1 * NH * (opts.scaleY !== undefined ? opts.scaleY : 0.78) + zOff * NH,
                    z: n.z,
                });
            });

            ctx.lineWidth = 1;
            for (var i = 0; i < projected.length; i++) {
                for (var j = i + 1; j < projected.length; j++) {
                    var dx = projected[i].x - projected[j].x;
                    var dy = projected[i].y - projected[j].y;
                    var d = dx * dx + dy * dy;
                    if (d < linkThreshold) {
                        var a =
                            Math.max(0, 1 - d / linkThreshold) * (opts.strokeBase || 0.11);
                        ctx.strokeStyle =
                            'rgba(82, 109, 130, ' + (a + projected[i].z * 0.07) + ')';
                        ctx.beginPath();
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                        ctx.stroke();
                    }
                }
            }

            projected.forEach(function (p) {
                var r = 1.5 + p.z * 2;
                ctx.fillStyle = 'rgba(157, 178, 191, ' + (0.18 + p.z * 0.32) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 114, 255, ' + (0.06 + p.z * 0.07) + ')';
                ctx.stroke();
            });

            requestAnimationFrame(draw);
        }

        function onResize() {
            resize();
        }

        resize();
        window.addEventListener('resize', onResize);
        requestAnimationFrame(draw);

        return function destroy() {
            running = false;
            window.removeEventListener('resize', onResize);
        };
    }

    var reducedMotion =
        typeof window.matchMedia !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ch = document.getElementById('contact-hero-canvas');
    var cv = document.getElementById('contact-visual-canvas');
    var cg = document.getElementById('contact-global-canvas');

    if (!reducedMotion) {
        initMeshCanvas(ch, { densityDiv: 24000, maxNodes: 48, linkThreshold: 9600, driftScale: 1 });
        initMeshCanvas(cv, { densityDiv: 18000, maxNodes: 36, linkThreshold: 7800, driftScale: 1.08 });
        initMeshCanvas(cg, {
            densityDiv: 28000,
            maxNodes: 52,
            linkThreshold: 11000,
            driftScale: 0.92,
            scaleX: 1.02,
            scaleY: 0.82,
        });
    }

    var header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    });

    var burger = document.querySelector('.burger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var closeBtn = document.querySelector('.mobile-close');

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

    document.querySelectorAll('.mobile-menu-card a').forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) closeMobileMenu();
        });
    }

    var contactFormEl = document.getElementById('digifact-contact-form');
    if (contactFormEl) {
        contactFormEl.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Transmission queued. (demo — connect endpoint when ready)');
            contactFormEl.reset();
        });
    }

    /* --- GSAP --- */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (reducedMotion) return;

    var ceoParaEl = document.querySelector('.contact-ceo-text');
    var ceoPlainText = ceoParaEl && ceoParaEl.textContent ? ceoParaEl.textContent.trim() : '';
    if (ceoParaEl && ceoPlainText) {
        ceoParaEl.innerHTML = ceoPlainText
            .split(/\s+/)
            .map(function (w) {
                return '<span class="contact-ceo-word">' + w + '</span>';
            })
            .join(' ');
    }

    var heroEl = document.querySelector('.contact-hero-content');
    if (heroEl) {
        gsap.from(heroEl.children, {
            y: 46,
            opacity: 0,
            duration: 1.08,
            stagger: 0.11,
            ease: 'power3.out',
            delay: 0.08,
        });
    }

    gsap.from('.contact-hero-giant .bg-text', {
        opacity: 0,
        scale: 1.035,
        duration: 1.32,
        ease: 'power2.out',
    });

    gsap.to('.contact-hero-giant .bg-text', {
        y: -128,
        ease: 'none',
        scrollTrigger: {
            trigger: '.contact-hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.15,
        },
    });

    if (ch) {
        gsap.to(ch, {
            opacity: 0.2,
            y: 36,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

    var cfW = document.querySelector('.contact-form-watermark .bg-text');
    if (cfW) {
        gsap.to(cfW, {
            y: -130,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-channel',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.3,
            },
        });
    }

    gsap.from('.contact-split-form', {
        scrollTrigger: {
            trigger: '.contact-split',
            start: 'top 72%',
        },
        x: -40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
    });

    gsap.from('.contact-split-visual', {
        scrollTrigger: {
            trigger: '.contact-split',
            start: 'top 72%',
            toggleActions: 'play none none reverse',
        },
        x: 54,
        opacity: 0,
        rotateY: 10,
        transformOrigin: 'right center',
        clipPath: 'inset(0 0 0 100%)',
        duration: 1.05,
        ease: 'power4.inOut',
        transformPerspective: 1100,
        onComplete: function () {
            gsap.set('.contact-split-visual', { rotateY: 0, clearProps: 'transform' });
        },
    });

    gsap.utils.toArray('.contact-split-visual .ui-element').forEach(function (ui) {
        gsap.from(ui, {
            scrollTrigger: {
                trigger: '.contact-split-visual',
                start: 'top 70%',
            },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            delay: 0.45,
            ease: 'back.out(1.25)',
            stagger: 0.08,
        });
        gsap.to(ui, {
            y: 10,
            duration: 2.1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 0.4,
        });
    });

    gsap.utils.toArray('.contact-detail-card').forEach(function (card, i) {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
            },
            y: 48,
            opacity: 0,
            duration: 0.78,
            delay: i * 0.05,
            ease: 'power3.out',
        });
    });

    var globW = document.querySelector('.contact-global-watermark .bg-text');
    if (globW) {
        gsap.to(globW, {
            y: -100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-global',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
            },
        });
    }

    gsap.from('.contact-global-copy > *', {
        scrollTrigger: {
            trigger: '.contact-global',
            start: 'top 72%',
        },
        y: 36,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
    });

    if (cg) {
        gsap.to(cg, {
            y: -24,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-global',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

    var ceoTxt = document.querySelector('.contact-ceo-watermark .bg-text');
    if (ceoTxt) {
        gsap.to(ceoTxt, {
            y: -86,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-ceo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.08,
            },
        });
    }

    gsap.from('.contact-ceo-inner > *', {
        scrollTrigger: {
            trigger: '.contact-ceo',
            start: 'top 74%',
            toggleActions: 'play none none reverse',
        },
        y: 32,
        opacity: 0,
        stagger: 0.13,
        duration: 0.92,
        ease: 'power3.out',
    });

    if (ceoParaEl && ceoParaEl.querySelector('.contact-ceo-word')) {
        gsap.from('.contact-ceo-word', {
            scrollTrigger: {
                trigger: '.contact-ceo',
                start: 'top 73%',
                toggleActions: 'play none none reverse',
            },
            y: 22,
            opacity: 0,
            stagger: 0.05,
            duration: 0.58,
            ease: 'power2.out',
            delay: 0.18,
        });
    }

    gsap.from('.contact-details-head > *', {
        scrollTrigger: {
            trigger: '.contact-details',
            start: 'top 82%',
            toggleActions: 'play none none reverse',
        },
        y: 28,
        opacity: 0,
        stagger: 0.1,
        duration: 0.82,
        ease: 'power3.out',
    });

    gsap.from('.contact-bridge-inner', {
        scrollTrigger: {
            trigger: '.contact-bridge',
            start: 'top 82%',
        },
        y: 40,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
    });

    gsap.from('.footer.contact-footer-enter', {
        scrollTrigger: {
            trigger: '.contact-footer-enter',
            start: 'top 92%',
            end: 'top 70%',
            scrub: 0.6,
        },
        opacity: 0.92,
        y: 20,
        ease: 'none',
    });

    gsap.utils.toArray('.contact-submit-btn, .contact-bridge-primary').forEach(function (btn) {
        btn.addEventListener('mouseenter', function () {
            gsap.to(btn, { scale: 1.02, duration: 0.4, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
            gsap.to(btn, { scale: 1, duration: 0.5, ease: 'power2.out' });
        });
    });
})();

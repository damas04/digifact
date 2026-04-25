import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

// --- THREE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#canvas-3d'), 
    antialias: true, 
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(2, 5, 5);
scene.add(mainLight);
camera.position.z = 5;

let model;
const loader = new GLTFLoader();

loader.load('assets/globe.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);
    setupAnimations();
}, undefined, (err) => console.error(err));

function setupAnimations() {
    if (!model) return;
    
    // 1. Globe Zoom
    gsap.to(model.scale, { 
        x: 18, y: 18, z: 18, 
        scrollTrigger: { 
            trigger: ".hero-section", 
            start: "top top", 
            end: "bottom bottom", 
            scrub: 1.2 
        } 
    });
    
    // 2. Teks Transition (Hero)
    const texts = document.querySelectorAll('.text-item');
    const textTl = gsap.timeline({ 
        scrollTrigger: { 
            trigger: ".hero-section", 
            start: "top top", 
            end: "bottom bottom", 
            scrub: 1 
        } 
    });
    
    texts.forEach((text, i) => {
        const isLast = i === texts.length - 1;
        textTl.to(text, { autoAlpha: 1, y: 0, duration: 1 })
              .to(text, { opacity: 1, duration: isLast ? 3 : 1 });
        if (!isLast) textTl.to(text, { autoAlpha: 0, y: -30, duration: 2 });
    });
    
    // 3. Fade Out Hero & Fade In Spacer
    gsap.to(".hero-section", { 
        opacity: 0, 
        scrollTrigger: { 
            trigger: ".hero-section", 
            start: "90% top", 
            end: "bottom top", 
            scrub: true 
        } 
    });
    
    // 4. TEXT REVEAL ANIMATION (Huruf per Huruf)
    const revealElement = document.querySelector('.reveal-text');
    if (revealElement) {
        const textContent = revealElement.textContent;
        revealElement.innerHTML = textContent.split("").map(ch => 
            `<span>${ch === " " ? "&nbsp;" : ch}</span>`
        ).join("");
        
        const letters = revealElement.querySelectorAll('span');
        gsap.to(letters, { 
            opacity: 1, 
            y: 0, 
            stagger: 0.2, 
            ease: "power3.out", 
            scrollTrigger: { 
                trigger: ".content-spacer", 
                start: "top 70%", 
                end: "top 20%", 
                scrub: 1.5 
            } 
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.002;
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Header scroll effect
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
});

// Mobile menu with CLOSE functionality
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");
const closeBtn = document.querySelector(".mobile-close");
const mobileLinks = document.querySelectorAll(".mobile-menu-card a");
const mobileCtaBtn = document.querySelector(".mobile-cta");

function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "";
}

function openMobileMenu() {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
}

if (burger) burger.addEventListener("click", openMobileMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener("click", closeMobileMenu));
if (mobileCtaBtn) mobileCtaBtn.addEventListener("click", closeMobileMenu);

// Close on backdrop click
if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) closeMobileMenu();
    });
}

// 1. Parallax Teks Raksasa
gsap.to(".bg-text", {
    y: -200,
    scrollTrigger: {
        trigger: ".cinematic-container",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
    }
});

// 2. Parallax Gambar
gsap.to(".hero-img", {
    scale: 1.3,
    y: -50,
    scrollTrigger: {
        trigger: ".cinematic-container",
        scrub: true
    }
});

// 3. Floating UI Elements (Animasi Mandiri)
gsap.to(".ui-element", {
    y: 15,
    duration: 2,
    repeat: -1,
    yoyo: true,
    stagger: 0.5,
    ease: "sine.inOut"
});

// 4. Reveal Content
const cinematicTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".cinematic-container",
        start: "top 60%"
    }
});

cinematicTl.from(".image-area", { 
    clipPath: "inset(100% 0 0 0)", 
    duration: 1.2, 
    ease: "power4.inOut" 
})
.from(".main-heading", { 
    y: 80, 
    opacity: 0, 
    duration: 1 
}, "-=0.8")
.from(".content-area .description", { 
    opacity: 0, 
    y: 20, 
    duration: 0.8 
}, "-=0.5")
.from(".ui-element", { 
    scale: 0, 
    opacity: 0, 
    stagger: 0.2 
}, "-=0.5");

// 3D Tilt Cards
const cards = document.querySelectorAll('.card-3d');
cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 12;
        const rotateY = (centerX - x) / 12;
        
        gsap.to(inner, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.4,
            ease: "power2.out"
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(inner, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
        });
    });
});

// Animasi Masuk saat Scroll untuk Cards
gsap.from(".card-3d", {
    scrollTrigger: {
        trigger: ".services-section",
        start: "top 70%",
    },
    y: 100,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: "power4.out"
});

// ========== ANIMASI SECTION 5 ==========
const section5 = document.querySelector('.section-5');
const textArea = document.querySelector('.text-area');

// Tambahkan scanning line effect
if (section5) {
    const scanLine = document.createElement('div');
    scanLine.classList.add('scan-line');
    section5.appendChild(scanLine);
}

// Animasi ScrollTrigger untuk section-5
if (textArea) {
    gsap.from(".text-area", {
        scrollTrigger: {
            trigger: ".section-5",
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
        },
        opacity: 0,
        x: 100,
        duration: 1.5,
        ease: "power3.out"
    });
}

// Animasi teks per huruf untuk heading section-5
const section5Heading = document.querySelector('.text-area h1');
if (section5Heading) {
    const headingText = section5Heading.textContent;
    section5Heading.innerHTML = headingText.split("").map(char => 
        `<span style="display: inline-block; opacity: 0; transform: translateY(20px);">${char === " " ? "&nbsp;" : char}</span>`
    ).join("");
    
    const headingLetters = section5Heading.querySelectorAll('span');
    
    gsap.to(headingLetters, {
        scrollTrigger: {
            trigger: ".section-5",
            start: "top 70%",
        },
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.2)"
    });
}

// Glitch effect pada hover untuk text-area
if (textArea) {
    textArea.addEventListener('mouseenter', () => {
        gsap.to(textArea, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    textArea.addEventListener('mouseleave', () => {
        gsap.to(textArea, {
            scale: 1,
            duration: 0.3,
            ease: "power2.in"
        });
    });
}


const form = document.querySelector(".contact-form");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        alert("Message sent! (dummy)");
        form.reset();
    });
}

gsap.utils.toArray(".why-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power3.out"
    });
});

gsap.from(".cta-terminal", {
    scrollTrigger: {
        trigger: ".cta-section",
        start: "top 80%"
    },
    opacity: 0,
    scale: 0.95,
    duration: 1
});




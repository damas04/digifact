import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

// --- THREE.JS SETUP ---
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

        if (!isLast) {
            textTl.to(text, { autoAlpha: 0, y: -30, duration: 2 });
        }
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

    // --- 4. TEXT REVEAL ANIMATION (Huruf per Huruf) ---
    
    const revealElement = document.querySelector('.reveal-text');
    const textContent = revealElement.textContent;
    const characters = textContent.split("");
    
    revealElement.textContent = ""; // Kosongkan teks asli

    // Masukkan kembali teks yang sudah dibungkus span
    characters.forEach(char => {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        revealElement.appendChild(span);
    });

    const letters = revealElement.querySelectorAll('span');

    gsap.to(letters, {
        opacity: 1,
        y: 0,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".content-spacer",
            start: "top 10%", // Mulai muncul saat section terlihat 60% dari bawah
            end: "top 30%",   // Selesai saat section hampir di atas
            scrub: 2        // Animasi mengikuti scroll dengan sedikit smoothing
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.002;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");

burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
});

// 1. Parallax Teks Raksasa (Kecepatan Lambat)
gsap.to(".bg-text", {
    y: -200,
    scrollTrigger: {
        trigger: ".cinematic-container",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
    }
});

// 2. Parallax Gambar (Kecepatan Sedang)
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
    duration: 1.5, 
    ease: "power4.inOut" 
})
.from(".main-heading", { 
    y: 100, 
    opacity: 0, 
    duration: 1, 
    ease: "power3.out" 
}, "-=1")
.from(".sub-text", { 
    opacity: 0, 
    y: 20, 
    duration: 0.8 
}, "-=0.5")
.from(".ui-element", { 
    scale: 0, 
    opacity: 0, 
    stagger: 0.2 
}, "-=0.5");


const cards = document.querySelectorAll('.card-3d');

cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // posisi x di dalam card
        const y = e.clientY - rect.top;  // posisi y di dalam card
        
        // Menghitung derajat kemiringan (maksimal 15 derajat)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        gsap.to(inner, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    card.addEventListener('mouseleave', () => {
        // Balikkan ke posisi semula
        gsap.to(inner, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
        });
    });
});

// Animasi Masuk saat Scroll
gsap.from(".card-3d", {
    scrollTrigger: {
        trigger: ".services-section",
        start: "top 70%",
    },
    y: 100,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    ease: "power4.out"
});
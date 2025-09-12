function toggleMenu(){
    const navItem = document.getElementById("nav-item");
    const menuButton = document.querySelector(".menu");
    const overlay = document.querySelector(".menu-overlay");
    
    navItem.classList.toggle("show");
    menuButton.classList.toggle("active");
    
    // Toggle overlay if it exists
    if (overlay) {
        overlay.classList.toggle("show");
    }
}

function closeMenu() {
    const navItem = document.getElementById("nav-item");
    const menuButton = document.querySelector(".menu");
    const overlay = document.querySelector(".menu-overlay");
    
    navItem.classList.remove("show");
    menuButton.classList.remove("active");
    
    // Hide overlay if it exists
    if (overlay) {
        overlay.classList.remove("show");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Initialize Typed.js
    new Typed('#typed-text', {
        strings: ["Hey I'm", "Welcome!", "Glad to see you!"],
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 1000,
        loop: true
    });
    
    // Create overlay element for mobile menu
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    // Add click event to overlay to close menu
    overlay.addEventListener('click', closeMenu);
    
    // Add click events to all navigation links to close menu
    const navLinks = document.querySelectorAll('.nav-item .tab');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close menu when any nav link is clicked
            setTimeout(closeMenu, 150); // Small delay for better UX
        });
    });
    
    // Close menu when clicking outside of it
    document.addEventListener('click', function(e) {
        const navContainer = document.querySelector('.nav-container');
        const navItem = document.getElementById("nav-item");
        
        // Check if click is outside nav container and menu is open
        if (!navContainer.contains(e.target) && navItem.classList.contains('show')) {
            closeMenu();
        }
    });
    
    // Close menu on escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    
    // Handle window resize - close menu if window becomes large
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    // Smooth scroll behavior for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // -------- Performance: lazy-load non-critical images --------
    // Eagerly keep only the main profile image if present
    const allImages = Array.from(document.querySelectorAll('img'));
    allImages.forEach(img => {
        const isHero = img.classList.contains('logo');
        if (!isHero) {
            if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
            // Modern hint to browser for low priority assets
            if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
        } else {
            // Ensure the hero image is prioritized
            img.setAttribute('fetchpriority', 'high');
            img.setAttribute('decoding', 'async');
        }
    });

    // -------- Scroll reveal animations (motion-safe) --------
    const revealTargets = document.querySelectorAll([
        '.card',
        '.card1',
        '.project-ui',
        '.contact-page',
        '.about',
        '.skill-page',
        '.project-section',
        '.work-card',
        '.scroll',
        '.contact-card'
    ].join(','));

    revealTargets.forEach(el => el.classList.add('reveal'));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -5% 0px'
        });

        revealTargets.forEach(el => io.observe(el));
    } else {
        // If reduced motion or no IO support, show everything immediately
        revealTargets.forEach(el => el.classList.add('show'));
    }

    // -------- Stagger animation flow for grouped items --------
    function applyStagger(selector, stepMs = 80) {
        const items = document.querySelectorAll(selector);
        items.forEach((el, idx) => {
            const base = getComputedStyle(el).transitionDelay || '0ms';
            // Append stagger to any existing delay
            el.style.transitionDelay = `calc(${base} + ${idx * stepMs}ms)`;
        });
    }
    // Apply stagger to groups that use reveal (avoid .ser-card to keep hover intact)
    applyStagger('.about .card');
    applyStagger('.skill-page .card1');
    applyStagger('.project-section .project-ui');
    applyStagger('.work .work-card');

    // -------- Active nav highlight by section in view --------
    const sectionIds = ['home','about','skills','work','projects','services','contact'];
    const linkMap = new Map();
    sectionIds.forEach(id => {
        const link = document.querySelector(`.nav-item a[href="#${id}"]`);
        if (link) linkMap.set(id, link);
    });

    function setActive(id) {
        linkMap.forEach(el => el.classList.remove('active'));
        const target = linkMap.get(id);
        if (target) target.classList.add('active');
    }

    // Set initial active
    setActive(location.hash ? location.hash.slice(1) : 'home');

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            // Choose the most visible intersecting section
            let topEntry = null;
            for (const e of entries) {
                if (e.isIntersecting) {
                    if (!topEntry || e.intersectionRatio > topEntry.intersectionRatio) topEntry = e;
                }
            }
            if (topEntry) {
                const id = topEntry.target.getAttribute('id');
                if (id) setActive(id);
            }
        }, {
            threshold: [0.25, 0.5, 0.75],
            rootMargin: '-15% 0px -50% 0px'
        });

        sectionIds.forEach(id => {
            const sec = document.getElementById(id);
            if (sec) sectionObserver.observe(sec);
        });
    } else {
        // Scroll fallback
        window.addEventListener('scroll', () => {
            let current = 'home';
            const y = window.scrollY + 140;
            sectionIds.forEach(id => {
                const sec = document.getElementById(id);
                if (sec && sec.offsetTop <= y) current = id;
            });
            setActive(current);
        });
    }
});
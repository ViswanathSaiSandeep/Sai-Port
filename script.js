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

    // -------- Contact form: submit without leaving page --------
    const form = document.getElementById('contactForm');
    if (form) {
        const statusEl = document.getElementById('form-status');
        const sendBtn = document.getElementById('sendBtn');
        const messageEl = document.getElementById('message');
        const counterEl = document.getElementById('messageCounter');
        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const nameHint = document.getElementById('nameHint');
        const emailHint = document.getElementById('emailHint');
        const messageHint = document.getElementById('messageHint');

        // Live character counter for message textarea
        const updateMessageCount = () => {
            if (!messageEl || !counterEl) return;
            const max = parseInt(messageEl.getAttribute('maxlength') || '500', 10);
            const len = (messageEl.value || '').length;
            counterEl.textContent = `${len}/${max}`;
        };
        if (messageEl && counterEl) {
            messageEl.addEventListener('input', updateMessageCount);
            updateMessageCount();
        }

        // -------- Soft validation helpers --------
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        function validateName() {
            const v = (nameEl.value || '').trim();
            const ok = v.length >= 2;
            nameEl.classList.toggle('valid', ok);
            nameEl.classList.toggle('invalid', !ok && v.length > 0);
            nameHint.textContent = ok || v.length === 0 ? '' : 'Please enter at least 2 characters.';
            return ok;
        }

        function validateEmail() {
            const v = (emailEl.value || '').trim();
            const ok = emailRegex.test(v);
            emailEl.classList.toggle('valid', ok);
            emailEl.classList.toggle('invalid', !ok && v.length > 0);
            emailHint.textContent = ok || v.length === 0 ? '' : 'Email looks invalid';
            return ok;
        }

        function validateMessage() {
            const v = (messageEl.value || '').trim();
            const ok = v.length >= 5; // minimal meaningful message
            messageEl.classList.toggle('valid', ok);
            messageEl.classList.toggle('invalid', !ok && v.length > 0);
            messageHint.textContent = ok || v.length === 0 ? '' : 'Please write a bit more.';
            return ok;
        }

        function updateSendState() {
            const allOk = validateName() & validateEmail() & validateMessage(); // bitwise to ensure all run
            sendBtn.disabled = !allOk;
        }

        // Attach input listeners
        if (nameEl) nameEl.addEventListener('input', updateSendState);
        if (emailEl) emailEl.addEventListener('input', updateSendState);
        if (messageEl) messageEl.addEventListener('input', updateSendState);
        // Initial state
        updateSendState();

        async function handleSubmit(e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Build FormData
            const data = new FormData(form);
            // Button animation with width expand/shrink
            const originalBtnHtml = sendBtn.innerHTML; // preserve to restore later
            let btnText = sendBtn.querySelector('.btn-text'); // fresh ref each submit
            const originalWidth = Math.ceil(sendBtn.getBoundingClientRect().width); // keep width stable
            sendBtn.style.width = `${originalWidth}px`;
            sendBtn.disabled = true;
            // Clear any external status if present
            if (statusEl) {
                statusEl.textContent = '';
                statusEl.className = 'form-status';
            }
            const iconEl = sendBtn.querySelector('i');
            // ensure plane icon is shown at start
            if (iconEl) iconEl.className = 'fa-solid fa-paper-plane';
            // trigger is-sending state
            sendBtn.classList.add('is-sending');
            // compute travel distance for the plane so it slides nicely within the compact button
            try {
                const btnRect = sendBtn.getBoundingClientRect();
                const iconRect = iconEl ? iconEl.getBoundingClientRect() : { width: 16 };
                // leave some padding on the right; cap travel to avoid overshoot
                const travel = Math.max(20, Math.min(56, btnRect.width - iconRect.width - 24));
                sendBtn.style.setProperty('--plane-travel', `${Math.round(travel)}px`);
                sendBtn.style.setProperty('--plane-duration', '0.9s');
            } catch (_) {}

            // Kick off network request
            const planeAnimMs = 900; // keep in sync with --plane-duration
            let resp;
            try {
                const fetchPromise = fetch(form.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: data
                });
                // Ensure we don't finish UI before the plane animation completes
                const delay = new Promise(r => setTimeout(r, planeAnimMs));
                const [r] = await Promise.all([fetchPromise, delay]);
                resp = r;

                if (resp.ok) {
                    form.reset();
                    // Also reset the message counter to 0 explicitly
                    updateMessageCount();
                    // Sent state with expanded width to fit success text
                    sendBtn.classList.remove('is-sending');
                    sendBtn.classList.add('btn-sent');
                    const successText = 'Sent, You will get notified soon';
                    const prevWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                    sendBtn.querySelector('i').className = 'fa-solid fa-check';
                    if (btnText) btnText.textContent = successText;
                    // Expand width smoothly to fit success text
                    sendBtn.style.width = 'auto';
                    let targetWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                    // Clamp to available form width on small screens
                    const container = sendBtn.closest('.contact-form') || sendBtn.parentElement;
                    if (container) {
                        const cs = getComputedStyle(container);
                        const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
                        const maxW = Math.max(0, Math.floor(container.clientWidth - padX - 8));
                        targetWidth = Math.min(targetWidth, maxW);
                    }
                    sendBtn.style.width = prevWidth + 'px';
                    requestAnimationFrame(() => { sendBtn.style.width = targetWidth + 'px'; });
                } else {
                    const json = await resp.json().catch(() => null);
                    let msg = 'Oops, something went wrong. Please try again later.';
                    if (json && json.errors) {
                        msg = json.errors.map(e => e.message).join(' ');
                    }
                    // Error: reflect on button for clarity
                    // Reset the message field and counter per request
                    if (messageEl) messageEl.value = '';
                    updateMessageCount();
                    const isMobile = window.matchMedia('(max-width: 768px)').matches;
                    const failText = isMobile ? 'Failed! Try again' : 'Failed ! Please try again';
                    sendBtn.classList.remove('is-sending');
                    sendBtn.classList.add('btn-error');
                    sendBtn.querySelector('i').className = 'fa-solid fa-triangle-exclamation';
                    const prevWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                    if (btnText) btnText.textContent = failText;
                    // Expand width smoothly to fit failure text
                    sendBtn.style.width = 'auto';
                    let targetWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                    const container = sendBtn.closest('.contact-form') || sendBtn.parentElement;
                    if (container) {
                        const cs = getComputedStyle(container);
                        const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
                        const maxW = Math.max(0, Math.floor(container.clientWidth - padX - 8));
                        targetWidth = Math.min(targetWidth, maxW);
                    }
                    sendBtn.style.width = prevWidth + 'px';
                    requestAnimationFrame(() => { sendBtn.style.width = targetWidth + 'px'; });
                }
            } catch (err) {
                // Network failure branch: reflect failure in button, expand then revert
                if (messageEl) messageEl.value = '';
                updateMessageCount();
                const isMobile = window.matchMedia('(max-width: 768px)').matches;
                const failText = isMobile ? 'Failed! Try again' : 'Failed ! Please try again';
                sendBtn.classList.remove('is-sending');
                sendBtn.classList.add('btn-error');
                sendBtn.querySelector('i').className = 'fa-solid fa-triangle-exclamation';
                const prevWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                if (btnText) btnText.textContent = failText;
                sendBtn.style.width = 'auto';
                let targetWidth = Math.ceil(sendBtn.getBoundingClientRect().width);
                const container = sendBtn.closest('.contact-form') || sendBtn.parentElement;
                if (container) {
                    const cs = getComputedStyle(container);
                    const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
                    const maxW = Math.max(0, Math.floor(container.clientWidth - padX - 8));
                    targetWidth = Math.min(targetWidth, maxW);
                }
                sendBtn.style.width = prevWidth + 'px';
                requestAnimationFrame(() => { sendBtn.style.width = targetWidth + 'px'; });
            } finally {
                // Keep success text for a moment, then revert to compact with a smooth shrink animation
                const revertDelay = sendBtn.classList.contains('btn-sent') ? 2200 : 1300;
                setTimeout(() => {
                    // Start from current expanded width
                    const currentW = Math.ceil(sendBtn.getBoundingClientRect().width);
                    sendBtn.style.width = currentW + 'px';
                    // Restore original markup before shrinking so target width reflects compact content
                    sendBtn.innerHTML = originalBtnHtml;
                    // Re-bind references after innerHTML replacement
                    const i = sendBtn.querySelector('i');
                    btnText = sendBtn.querySelector('.btn-text');
                    // Next frame, animate down to the original compact width we measured at submit start
                    requestAnimationFrame(() => {
                        sendBtn.classList.remove('is-sending', 'btn-sent', 'btn-error');
                        sendBtn.style.width = Math.ceil(originalWidth) + 'px';
                        // After transition ends, cleanup and re-enable
                        const onEnd = () => {
                            sendBtn.style.width = '';
                            sendBtn.removeEventListener('transitionend', onEnd);
                            sendBtn.disabled = false;
                            // After revert, re-evaluate validity to keep disabled state correct
                            updateSendState();
                        };
                        sendBtn.addEventListener('transitionend', onEnd);
                        // Fallback in case transitionend doesn't fire
                        setTimeout(onEnd, 450);
                    });
                }, revertDelay);
            }
        }

        form.addEventListener('submit', handleSubmit);
    }
});
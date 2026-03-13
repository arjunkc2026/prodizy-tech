// Navbar reference (used by parallax below)
const navbar = document.querySelector('.navbar');

// Canvas Particle Animation
const canvas = document.getElementById('particleCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.fillStyle = `rgba(192, 192, 192, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.strokeStyle = `rgba(192, 192, 192, ${0.1 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Stats Counter Animation
function animateCounter(element, target) {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for stats
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValue = entry.target;
            const target = parseInt(statValue.getAttribute('data-count'));
            animateCounter(statValue, target);
            statsObserver.unobserve(statValue);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-value').forEach(stat => {
    statsObserver.observe(stat);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
});

// Double rAF ensures layout is fully painted before we check positions.
// This fixes the refresh bug: on fast/cached reloads, getBoundingClientRect()
// returns 0 synchronously, so the viewport check fails and cards stay opacity:0.
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        document.querySelectorAll(
            '.testimonial-card, .stat-card, .value-card, ' +
            '.service-card, .position-card, .pricing-card, .portfolio-card, ' +
            '.benefit-card, .addon-card, .faq-item, .process-step, ' +
            '.content-block, .info-item, .member-card'
        ).forEach((el, i) => {
            if (i % 4 === 1) el.classList.add('reveal-delay-1');
            if (i % 4 === 2) el.classList.add('reveal-delay-2');
            if (i % 4 === 3) el.classList.add('reveal-delay-3');

            // Check viewport BEFORE adding .reveal so already-visible elements
            // never flash invisible then reappear
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (inView) {
                // Already visible — reveal immediately with no flash
                el.classList.add('reveal', 'revealed');
            } else {
                // Below fold — hide and watch for scroll
                el.classList.add('reveal');
                revealObserver.observe(el);
            }
        });
    });
});

// Button ripple effect
document.querySelectorAll('button, .card-link').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.pointerEvents = 'none';
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.transition = 'transform 0.6s, opacity 0.6s';
            ripple.style.transform = 'translate(-50%, -50%) scale(10)';
            ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight * 0.8);
    }
});

// Testimonial slider - Auto-scroll + Manual control
const testimonialSlider = document.querySelector('.testimonial-slider');
const testimonialTrack = document.querySelector('.testimonial-track');

if (testimonialSlider && testimonialTrack) {
    // Clone testimonials for infinite scroll
    const testimonials = Array.from(testimonialTrack.children);
    testimonials.forEach(testimonial => {
        const clone = testimonial.cloneNode(true);
        testimonialTrack.appendChild(clone);
    });
    testimonials.forEach(testimonial => {
        const clone = testimonial.cloneNode(true);
        testimonialTrack.appendChild(clone);
    });

    // Pause animation on hover
    testimonialSlider.addEventListener('mouseenter', () => {
        testimonialTrack.style.animationPlayState = 'paused';
    });
    
    testimonialSlider.addEventListener('mouseleave', () => {
        testimonialTrack.style.animationPlayState = 'running';
    });
    
    // Enable manual drag scrolling
    let isDown = false;
    let startX;
    let scrollLeft;

    testimonialSlider.addEventListener('mousedown', (e) => {
        isDown = true;
        testimonialSlider.style.cursor = 'grabbing';
        startX = e.pageX - testimonialSlider.offsetLeft;
        scrollLeft = testimonialSlider.scrollLeft;
    });

    testimonialSlider.addEventListener('mouseleave', () => {
        isDown = false;
        testimonialSlider.style.cursor = 'grab';
    });

    testimonialSlider.addEventListener('mouseup', () => {
        isDown = false;
        testimonialSlider.style.cursor = 'grab';
    });

    testimonialSlider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - testimonialSlider.offsetLeft;
        const walk = (x - startX) * 2;
        testimonialSlider.scrollLeft = scrollLeft - walk;
    });
}

// =============================================
// MAGNETIC BUTTONS — subtle pull toward cursor
// =============================================
document.querySelectorAll('.hero-cta, .mega-cta, .cta-button, .package-btn').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.22;
        const dy = (e.clientY - cy) * 0.22;
        this.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// =============================================
// PAGE TRANSITION — smooth fade out on navigate
// =============================================
const overlay = document.createElement('div');
overlay.style.cssText = `
    position: fixed; inset: 0; background: #000;
    opacity: 0; pointer-events: none;
    z-index: 99990; transition: opacity 0.35s ease;
`;
document.body.appendChild(overlay);

document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http') || link.target === '_blank') return;
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const dest = this.href;
        overlay.style.pointerEvents = 'all';
        overlay.style.opacity = '1';
        setTimeout(() => { window.location.href = dest; }, 350);
    });
});

window.addEventListener('pageshow', () => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
});


console.log('%c🚀 Welcome to Prodizy Tech!', 'background: #000; color: #c0c0c0; font-size: 24px; padding: 15px; border: 2px solid #c0c0c0; font-weight: bold;');
console.log('%cIgnite Innovation 💡', 'color: #a0a0a0; font-size: 16px; padding: 5px;');

// Preloader - Shows only ONCE per session
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    if (preloader) {
        // Check if user has already seen preloader in this session
        const hasSeenPreloader = sessionStorage.getItem('preloaderShown');
        
        if (hasSeenPreloader) {
            // Already seen - hide immediately
            preloader.style.display = 'none';
            document.body.style.overflow = 'auto';
        } else {
            // First time - show preloader
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 500);
                
                // Mark as shown for this session
                sessionStorage.setItem('preloaderShown', 'true');
            }, 2000); // 2 seconds
        }
    }
});
/* ============================================
   PRODIZY TECH - INSANE NAVBAR JAVASCRIPT
   ============================================ */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
});

function initNavbar() {
    
    // ============================================
    // SCROLL PROGRESS BAR
    // ============================================
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + '%';
        }
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return; // safety check

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add 'scrolled' class when scrolled down 100px
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
});
    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }

    // ============================================
    // ACTIVE LINK DETECTION
    // ============================================
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ============================================
    // MAGNETIC EFFECT FOR BUTTONS
    // ============================================
    const magneticButtons = document.querySelectorAll('.nav-cta, .theme-toggle');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });

    // ============================================
    // RIPPLE EFFECT
    // ============================================
    function createRipple(element) {
        const ripple = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple-animation 0.6s ease-out';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Add ripple animation CSS dynamically
    if (!document.getElementById('ripple-animation-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation-style';
        style.textContent = `
            @keyframes ripple-animation {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // NAVBAR VISIBILITY ON SCROLL (OPTIONAL)
    // ============================================
    // Uncomment this section if you want the navbar to hide when scrolling down
    /*
    let lastScrollTop = 0;
    const delta = 5;
    const navbarHeight = navbar.offsetHeight;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (Math.abs(lastScrollTop - scrollTop) <= delta) {
            return;
        }
        
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    */

    // ============================================
    // KEYBOARD ACCESSIBILITY
    // ============================================
    // Close mobile menu with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================
    // Throttle scroll events for better performance
    let ticking = false;
    
    function throttleScroll(callback) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ============================================
    // CONSOLE WELCOME MESSAGE
    // ============================================
    console.log('%c🚀 PRODIZY TECH - Insane Navbar Loaded! 🔥', 
        'background: #000; color: #c0c0c0; font-size: 16px; padding: 10px; border: 2px solid #c0c0c0;');
    console.log('%cTheme:', localStorage.getItem('theme') || 'dark');
}

// ============================================
// EXPORT FOR MODULE USAGE (OPTIONAL)
// ============================================
// Uncomment if using ES6 modules
// export { initNavbar };
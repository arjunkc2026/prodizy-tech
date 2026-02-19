// ============================================
//   CURSOR GLOW EFFECT
//   Golden dot with golden smoke trail
// ============================================

(function () {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    // Create cursor dot
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `

        #cursor-dot {
            position: fixed;
            width: 8px;
            height: 8px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            transition: transform 0.15s ease, opacity 0.3s ease;
            box-shadow:
                0 0 8px rgba(255, 215, 0, 1),
                0 0 20px rgba(255, 215, 0, 0.6),
                0 0 40px rgba(255, 165, 0, 0.3);
            will-change: left, top;
        }

        #cursor-dot.clicking {
            transform: translate(-50%, -50%) scale(0.5);
        }

        #cursor-dot.hidden {
            opacity: 0;
        }

        .smoke-particle {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 99997;
            transform: translate(-50%, -50%);
            animation: smokeUp 0.9s ease-out forwards;
        }

        @keyframes smokeUp {
            0% {
                opacity: 0.7;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -160%) scale(2.5);
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(dot);

    let mouseX = -100, mouseY = -100;
    let lastSmokeX = -100, lastSmokeY = -100;

    // Dot follows mouse instantly
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        dot.classList.remove('hidden');

        // Only spawn smoke if mouse moved enough
        const dx = mouseX - lastSmokeX;
        const dy = mouseY - lastSmokeY;
        if (Math.sqrt(dx * dx + dy * dy) > 8) {
            spawnSmoke(mouseX, mouseY);
            lastSmokeX = mouseX;
            lastSmokeY = mouseY;
        }
    });

    // Smoke particle spawner
    function spawnSmoke(x, y) {
        const count = 2;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('smoke-particle');

            const size = Math.random() * 10 + 6;
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            const duration = Math.random() * 0.4 + 0.6;
            const delay = Math.random() * 0.08;

            // Golden palette — mix of gold, amber, orange
            const colors = [
                'rgba(255, 215, 0, 0.6)',
                'rgba(255, 185, 0, 0.5)',
                'rgba(255, 140, 0, 0.4)',
                'rgba(255, 200, 50, 0.5)',
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x + offsetX}px;
                top: ${y + offsetY}px;
                background: radial-gradient(circle, ${color}, transparent);
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                filter: blur(${Math.random() * 2 + 1}px);
            `;

            document.body.appendChild(p);

            // Remove after animation
            setTimeout(() => p.remove(), (duration + delay) * 1000);
        }
    }

    // Expand on interactive elements
    const interactives = 'a, button, [role="button"], input, textarea, select, label';

    // Click effect
    document.addEventListener('mousedown', () => {
        dot.classList.add('clicking');
        // Burst of smoke on click
        for (let i = 0; i < 6; i++) spawnSmoke(mouseX, mouseY);
    });
    document.addEventListener('mouseup', () => {
        dot.classList.remove('clicking');
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
        dot.classList.add('hidden');
    });
    document.addEventListener('mouseenter', () => {
        dot.classList.remove('hidden');
    });

    // ── Golden edge glow on cards & buttons ──
    const glowStyle = document.createElement('style');
    glowStyle.textContent = `
        .glow-target {
            position: relative;
            overflow: hidden;
        }
        .glow-target::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            padding: 1px;
            background: radial-gradient(
                180px circle at var(--mx, 50%) var(--my, 50%),
                rgba(255, 215, 0, 0.7),
                transparent 70%
            );
            -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            z-index: 1;
        }
        .glow-target:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(glowStyle);

    // Apply to all cards and buttons
    function applyGlowTargets() {
        const selectors = [
            'button', 'a', '.pricing-card', '.addon-card', '.service-card',
            '.portfolio-card', '.position-card', '.benefit-card', '.member-card',
            '.stat-item', '.hero-cta', '.nav-cta', '.package-btn', '.apply-btn',
            '.filter-btn', '.portfolio-link', '.team-preview-card', '.org-member .member-card'
        ].join(', ');

        document.querySelectorAll(selectors).forEach(el => {
            el.classList.add('glow-target');

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mx', x + '%');
                el.style.setProperty('--my', y + '%');
            });
        });
    }

    // Run on load and after components are injected
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyGlowTargets();
            // Re-run after navbar/footer components load
            setTimeout(applyGlowTargets, 800);
        });
    } else {
        applyGlowTargets();
        setTimeout(applyGlowTargets, 800);
    }
})();
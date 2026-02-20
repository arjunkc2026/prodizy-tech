// ============================================
//   CURSOR — Golden torch light
//   Illuminates entire page around cursor
//   + smoke trail + card edge glow
// ============================================

(function () {
    if (window.matchMedia('(hover: none)').matches) return;

    const style = document.createElement('style');
    style.textContent = `
        * { cursor: none !important; }

        #cursor-dot {
            position: fixed;
            width: 10px;
            height: 10px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999999;
            transform: translate(-50%, -50%);
            transition: transform 0.12s ease, opacity 0.3s ease;
            box-shadow:
                0 0 6px   rgba(255, 215, 0, 1),
                0 0 20px  rgba(255, 215, 0, 0.9),
                0 0 60px  rgba(255, 180, 0, 0.6),
                0 0 120px rgba(255, 140, 0, 0.35),
                0 0 200px rgba(255, 100, 0, 0.18),
                0 0 300px rgba(255,  80, 0, 0.08);
            will-change: left, top;
        }

        #cursor-dot.clicking {
            transform: translate(-50%, -50%) scale(0.45);
        }

        #cursor-dot.hidden { opacity: 0; }

        /* ── Page-wide torch light ───────────────────
           A fixed radial glow that follows the cursor,
           casting warm golden light across everything  */
        #torch-light {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 99998;
            background: radial-gradient(
                circle 350px at var(--tx, -999px) var(--ty, -999px),
                rgba(255, 200, 0, 0.07)  0%,
                rgba(255, 160, 0, 0.04) 40%,
                rgba(255, 120, 0, 0.02) 70%,
                transparent             100%
            );
            transition: opacity 0.4s ease;
            opacity: 0;
        }

        #torch-light.active { opacity: 1; }

        .smoke-particle {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999997;
            transform: translate(-50%, -50%);
            animation: smokeUp 0.85s ease-out forwards;
        }

        @keyframes smokeUp {
            0%   { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0;    transform: translate(-50%, -165%) scale(2.6); }
        }

        .glow-card { position: relative; }

        .glow-card::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: radial-gradient(
                220px circle at var(--gx, 50%) var(--gy, 50%),
                rgba(255, 200, 0, 0.95)  0%,
                rgba(255, 160, 0, 0.65) 28%,
                rgba(255, 120, 0, 0.2)  55%,
                transparent             75%
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            padding: 1.5px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: -1;
        }

        .glow-card.glow-active::after { opacity: 1; }

        .glow-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(
                160px circle at var(--gx, 50%) var(--gy, 50%),
                rgba(255, 200, 0, 0.07) 0%,
                transparent 65%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: -1;
        }

        .glow-card.glow-active::before { opacity: 1; }

        .glow-card > * { position: relative; z-index: 1; }
        .glow-card > .card-glow { z-index: -1 !important; position: absolute !important; }
    `;

    document.head.appendChild(style);

    // Torch light layer — sits over page, casts golden warmth
    const torchLight = document.createElement('div');
    torchLight.id = 'torch-light';
    document.body.appendChild(torchLight);

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = -999, mouseY = -999;
    let lastSmokeX = -999, lastSmokeY = -999;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
        dot.classList.remove('hidden');

        // Move torch light with cursor
        torchLight.style.setProperty('--tx', mouseX + 'px');
        torchLight.style.setProperty('--ty', mouseY + 'px');
        torchLight.classList.add('active');

        const dx = mouseX - lastSmokeX;
        const dy = mouseY - lastSmokeY;
        if (dx * dx + dy * dy > 64) {
            spawnSmoke(mouseX, mouseY);
            lastSmokeX = mouseX;
            lastSmokeY = mouseY;
        }
    });

    document.addEventListener('mouseleave', () => {
        dot.classList.add('hidden');
        torchLight.classList.remove('active');
    });
    document.addEventListener('mouseenter', () => {
        dot.classList.remove('hidden');
        torchLight.classList.add('active');
    });

    document.addEventListener('mousedown', () => {
        dot.classList.add('clicking');
        for (let i = 0; i < 8; i++) spawnSmoke(mouseX, mouseY);
    });
    document.addEventListener('mouseup', () => dot.classList.remove('clicking'));

    function spawnSmoke(x, y) {
        for (let i = 0; i < 2; i++) {
            const p = document.createElement('div');
            p.className = 'smoke-particle';
            const size  = Math.random() * 10 + 6;
            const ox    = (Math.random() - 0.5) * 12;
            const oy    = (Math.random() - 0.5) * 12;
            const dur   = Math.random() * 0.4 + 0.55;
            const delay = Math.random() * 0.07;
            const palette = ['rgba(255,215,0,0.6)','rgba(255,185,0,0.5)','rgba(255,140,0,0.4)','rgba(255,200,50,0.5)'];
            const color = palette[Math.floor(Math.random() * palette.length)];
            p.style.cssText = `
                width:${size}px; height:${size}px;
                left:${x + ox}px; top:${y + oy}px;
                background: radial-gradient(circle, ${color}, transparent);
                animation-duration:${dur}s; animation-delay:${delay}s;
                filter: blur(${Math.random() * 2 + 1}px);
            `;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), (dur + delay) * 1000 + 50);
        }
    }

    const CARD_SELECTORS = [
        '.service-showcase-card', '.testimonial-card', '.stat-item',
        '.service-card', '.process-step',
        '.pricing-card', '.addon-card', '.custom-package-card',
        '.portfolio-card', '.member-card', '.team-preview-card',
        '.position-card', '.benefit-card',
        '.stat-card', '.value-card', '.content-block',
        '.faq-item', '.info-item', '.contact-info-section',
        '.contact-info-box', '.legal-intro', '.legal-footer',
        'button:not(#cursor-dot)', '.hero-cta', '.package-btn',
        '.service-btn', '.apply-btn', '.custom-btn', '.cta-button',
        '.nav-cta', '.mega-cta', '.portfolio-link', '.filter-btn', '.social-icon',
    ].join(', ');

    function bindCard(el) {
        if (el._glowBound) return;
        el._glowBound = true;
        el.classList.add('glow-card');
        el.addEventListener('mouseenter', () => el.classList.add('glow-active'));
        el.addEventListener('mouseleave', () => el.classList.remove('glow-active'));
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--gx', ((e.clientX - r.left) / r.width  * 100) + '%');
            el.style.setProperty('--gy', ((e.clientY - r.top)  / r.height * 100) + '%');
        });
    }

    function applyGlow() { document.querySelectorAll(CARD_SELECTORS).forEach(bindCard); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyGlow(); setTimeout(applyGlow, 600); setTimeout(applyGlow, 1400);
        });
    } else {
        applyGlow(); setTimeout(applyGlow, 600); setTimeout(applyGlow, 1400);
    }

    const mutObs = new MutationObserver(applyGlow);
    const startObserving = () => mutObs.observe(document.body, { childList: true, subtree: true });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }

})();
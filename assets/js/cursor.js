// ============================================
//   CURSOR — Golden torch light
//   Illuminates entire page around cursor
//   + smoke trail + card edge glow
// ============================================

(function () {
    if (window.matchMedia('(hover: none)').matches) return;

    const style = document.createElement('style');
    style.textContent = `
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

    let mouseX = -999, mouseY = -999;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Move torch light with cursor
        torchLight.style.setProperty('--tx', mouseX + 'px');
        torchLight.style.setProperty('--ty', mouseY + 'px');
        torchLight.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
        torchLight.classList.remove('active');
    });
    document.addEventListener('mouseenter', () => {
        torchLight.classList.add('active');
    });

    document.addEventListener('mousedown', () => {});
    document.addEventListener('mouseup', () => {});

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
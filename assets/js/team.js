/* ============================================================
   team.js  —  Prodizy Tech Team Page
   
   1. Daily-seeded shuffle of the Level-2 C-suite order
   2. Dynamic SVG connector lines drawn from actual card positions
      (replaces brittle hardcoded CSS pseudo-element widths)
   ============================================================ */

// ── 1. C-suite daily shuffle ──────────────────────────────────

(function shuffleCsuite() {
    const combinations = [
        ["cfo", "cto", "coo"],
        ["cfo", "coo", "cto"],
        ["coo", "cfo", "cto"],
        ["cto", "coo", "cfo"],
        ["cto", "cfo", "coo"],
        ["coo", "cto", "cfo"],
    ];

    const today = new Date();
    const seed = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
    const combination = combinations[seed % combinations.length];

    combination.forEach((id, index) => {
        const card = document.getElementById("card-" + id);
        if (card) card.style.order = index;
    });
})();


// ── 2. SVG connector lines ────────────────────────────────────
//
// Strategy:
//   • Insert one <svg class="org-connectors"> as first child of .org-chart
//   • After layout settles (requestAnimationFrame inside a setTimeout),
//     measure every card's bounding rect relative to the chart container
//   • Draw:
//       – A vertical line from the bottom-centre of each parent card down
//         to the horizontal rail
//       – A horizontal rail spanning from leftmost to rightmost child
//       – A vertical line from the rail up to the top-centre of each child
//   • Re-draw on window resize (debounced)
//
// Connection map — each entry is { parent: selector, children: [selector, …] }
// "selector" targets the .member-card element inside an .org-member.
// ─────────────────────────────────────────────────────────────

const CONNECTION_MAP = [
    {
        parent: ".level-1 .org-member",
        children: [
            "#card-cfo",
            "#card-cto",
            "#card-coo",
        ],
    },
    {
        parent: ".level-1 .org-member",
        children: [".level-2b .org-member"],
    },
    {
        parent: ".level-2b .org-member",
        children: [
            ".level-3 .org-member:nth-child(1)",
            ".level-3 .org-member:nth-child(2)",
        ],
    },

];

// Stroke style constants
const STROKE = "rgba(192,192,192,0.45)";
const STROKE_WIDTH = 1.5;

let svg = null;

function getChartEl() {
    return document.querySelector(".org-chart");
}

function ensureSvg() {
    const chart = getChartEl();
    if (!chart) return null;

    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("org-connectors");
        svg.setAttribute("aria-hidden", "true");
        // Insert as first child so cards render on top via z-index
        chart.insertBefore(svg, chart.firstChild);
    }

    // Match chart dimensions (the SVG is position:absolute filling the chart)
    svg.setAttribute("width", chart.offsetWidth);
    svg.setAttribute("height", chart.scrollHeight);

    return svg;
}

/**
 * Returns the centre-bottom point of an element relative to the chart.
 */
function bottomCentre(el, chartRect) {
    const r = el.getBoundingClientRect();
    return {
        x: r.left - chartRect.left + r.width / 2,
        y: r.bottom - chartRect.top,
    };
}

/**
 * Returns the centre-top point of an element relative to the chart.
 */
function topCentre(el, chartRect) {
    const r = el.getBoundingClientRect();
    return {
        x: r.left - chartRect.left + r.width / 2,
        y: r.top - chartRect.top,
    };
}

function line(x1, y1, x2, y2) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("x1", Math.round(x1));
    el.setAttribute("y1", Math.round(y1));
    el.setAttribute("x2", Math.round(x2));
    el.setAttribute("y2", Math.round(y2));
    el.setAttribute("stroke", STROKE);
    el.setAttribute("stroke-width", STROKE_WIDTH);
    el.setAttribute("stroke-linecap", "round");
    return el;
}

function drawConnectors() {
    // Don't draw on mobile (CSS hides the SVG anyway, but skip the work)
    if (window.innerWidth <= 768) return;

    const chart = getChartEl();
    if (!chart) return;

    const svgEl = ensureSvg();
    if (!svgEl) return;

    // Clear previous paths
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    const chartRect = chart.getBoundingClientRect();

    CONNECTION_MAP.forEach(({ parent: parentSel, children: childSels }) => {
        const parentEl = chart.querySelector(parentSel);
        if (!parentEl) return;

        const parentCard = parentEl.querySelector(".member-card") || parentEl;

        // Resolve child elements, skipping any that don't exist
        const childEls = childSels
            .map((sel) => chart.querySelector(sel))
            .filter(Boolean);

        if (childEls.length === 0) return;

        const childCards = childEls.map(
            (el) => el.querySelector(".member-card") || el
        );

        const parentBottom = bottomCentre(parentCard, chartRect);
        const childTops = childCards.map((c) => topCentre(c, chartRect));

        // Mid-point Y of the vertical gap between parent and children
        const railY = (parentBottom.y + Math.min(...childTops.map((c) => c.y))) / 2;

        // Vertical line down from parent
        svgEl.appendChild(line(parentBottom.x, parentBottom.y, parentBottom.x, railY));

        if (childTops.length === 1) {
            // Single child: straight vertical, no horizontal rail needed
            svgEl.appendChild(line(childTops[0].x, railY, childTops[0].x, childTops[0].y));
        } else {
            // Horizontal rail
            const leftX = Math.min(...childTops.map((c) => c.x));
            const rightX = Math.max(...childTops.map((c) => c.x));
            svgEl.appendChild(line(leftX, railY, rightX, railY));

            // Vertical lines up to each child
            childTops.forEach((ct) => {
                svgEl.appendChild(line(ct.x, railY, ct.x, ct.y));
            });
        }
    });
}

// ── Reliable redraw using ResizeObserver ─────────────────────
//
// ResizeObserver fires whenever the chart container itself changes
// dimensions — catches devtools open/close, orientation changes,
// and window resizes far more reliably than window "resize" alone.
// The double-rAF ensures getBoundingClientRect() reads post-layout values.

let rafId = null;

function scheduleRedraw() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
            drawConnectors();
            rafId = null;
        });
    });
}

const chartEl = getChartEl();
if (chartEl && typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(scheduleRedraw);
    ro.observe(chartEl);
    // Also observe each org-level so shuffled card order changes trigger a redraw
    chartEl.querySelectorAll(".org-level").forEach((el) => ro.observe(el));
} else {
    // Fallback for old browsers
    window.addEventListener("resize", () => scheduleRedraw());
}

// Initial draw — wait for images to load so card heights are final
window.addEventListener("load", scheduleRedraw);
if (document.readyState === "complete") scheduleRedraw();
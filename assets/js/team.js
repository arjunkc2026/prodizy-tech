// Draw SVG connector lines between org chart levels
function drawOrgConnectors() {
    const existingSvg = document.getElementById('org-svg');
    if (existingSvg) existingSvg.remove();

    // Hide connectors on mobile (<=768px)
    if (window.innerWidth <= 768) return;

    const chart = document.querySelector('.org-chart');
    if (!chart) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'org-svg';
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    chart.style.position = 'relative';
    chart.insertBefore(svg, chart.firstChild);
    const chartRect = chart.getBoundingClientRect();
    function getCenter(el) {
        const r = el.getBoundingClientRect();
        const GAP = 12;
        return {
            x: r.left - chartRect.left + r.width / 2,
            top: r.top - chartRect.top - GAP,
            bottom: r.top - chartRect.top + r.height + GAP,
            mid: r.top - chartRect.top + r.height / 2
        };
    }
    function line(x1, y1, x2, y2) {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('stroke', '#c9a84c');
        l.setAttribute('stroke-width', '2.5');
        l.setAttribute('stroke-opacity', '0.85');
        svg.appendChild(l);
    }
    const level1Cards = document.querySelectorAll('.level-1 .member-card');
    const level2Cards = document.querySelectorAll('.level-2 .member-card');
    const level3Cards = document.querySelectorAll('.level-3 .member-card');
    if (!level1Cards.length || !level2Cards.length) return;
    const l1Centers = Array.from(level1Cards).map(getCenter);
    const l2Centers = Array.from(level2Cards).map(getCenter);
    const l3Centers = Array.from(level3Cards).map(getCenter);

    // Level 1 -> Level 2: single horizontal bar at midpoint of the gap
    const maxL1Bottom = Math.max(...l1Centers.map(c => c.bottom));
    const minL2Top = Math.min(...l2Centers.map(c => c.top));
    const midY1 = (maxL1Bottom + minL2Top) / 2;
    const midX1 = (l1Centers[0].x + l1Centers[l1Centers.length - 1].x) / 2;

    // Drop lines from L1 cards down to the single horizontal bar
    l1Centers.forEach(c => line(c.x, c.bottom, c.x, midY1));

    // Single horizontal bar connecting L1 drops
    if (l1Centers.length > 1) {
        line(l1Centers[0].x, midY1, l1Centers[l1Centers.length - 1].x, midY1);
    }

    // Single horizontal bar spanning L2 cards
    line(l2Centers[0].x, midY1, l2Centers[l2Centers.length - 1].x, midY1);

    // Drop lines down from horizontal bar to each L2 card
    l2Centers.forEach(c => line(c.x, midY1, c.x, c.top));

    // Level 2 -> Level 3: single horizontal bar at midpoint of the gap
    if (l3Centers.length) {
        const maxL2Bottom = Math.max(...l2Centers.map(c => c.bottom));
        const minL3Top = Math.min(...l3Centers.map(c => c.top));
        const midY2 = (maxL2Bottom + minL3Top) / 2;
        const midX2 = (l2Centers[0].x + l2Centers[l2Centers.length - 1].x) / 2;

        // Drop lines from L2 cards down to the single horizontal bar
        l2Centers.forEach(c => line(c.x, c.bottom, c.x, midY2));

        // Single horizontal bar spanning L2 and L3 cards
        const barLeft = Math.min(l2Centers[0].x, l3Centers[0].x);
        const barRight = Math.max(l2Centers[l2Centers.length - 1].x, l3Centers[l3Centers.length - 1].x);
        line(barLeft, midY2, barRight, midY2);

        // Drop lines down from horizontal bar to each L3 card
        l3Centers.forEach(c => line(c.x, midY2, c.x, c.top));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for images/layout to settle
    setTimeout(drawOrgConnectors, 300);
});
window.addEventListener('resize', () => {
    setTimeout(drawOrgConnectors, 100);
});
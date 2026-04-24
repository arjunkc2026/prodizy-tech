// Load Navigation and Footer Components

function fixLinks(container, isInPages) {
    // After injecting navbar/footer HTML, fix relative paths based on page depth
    container.querySelectorAll('a[href], img[src]').forEach(el => {
        const attr = el.tagName === 'IMG' ? 'src' : 'href';
        const val = el.getAttribute(attr);
        if (!val) return;
        
        if (isInPages) {
            // Already correct: ../ for root, ./ for pages
            // No change needed - navbar.html already has ../index.html and ./page.html
        } else {
            // We're at root - strip the ../ prefix and use direct paths
            if (val.startsWith('../')) {
                el.setAttribute(attr, val.replace('../', ''));
            }
            // Change ./page.html to pages/page.html
            if (val.startsWith('./') && val.endsWith('.html') && val !== './index.html') {
                el.setAttribute(attr, 'pages/' + val.slice(2));
            }
        }
    });
    
    // Also fix onclick attributes
    container.querySelectorAll('[onclick]').forEach(el => {
        let onclick = el.getAttribute('onclick');
        if (!onclick) return;
        if (!isInPages) {
            onclick = onclick.replace(/'\.\.\//, "'").replace(/'\.\/([^']+\.html)'/, (m, p) => `'pages/${p}'`);
            el.setAttribute('onclick', onclick);
        }
    });
}

async function loadComponents() {
    const isInPages = window.location.pathname.includes('/pages/') || 
                      window.location.href.includes('/pages/');

    // Load Navigation
    try {
        const navResponse = await fetch('../pages/navbar.html');
        const navHTML = await navResponse.text();
        const navContainer = document.getElementById('navbar-placeholder');
        navContainer.innerHTML = navHTML;
        fixLinks(navContainer, isInPages);
        
        if (typeof initNavbar === 'function') {
            initNavbar();
        }
        setActiveNavLink();
    } catch (error) {
        // Fallback: try root-relative path (works on web server)
        try {
            const navResponse = await fetch('/pages/navbar.html');
            const navHTML = await navResponse.text();
            document.getElementById('navbar-placeholder').innerHTML = navHTML;
            if (typeof initNavbar === 'function') initNavbar();
            setActiveNavLink();
        } catch(e) {
            console.error('Error loading navigation:', e);
        }
    }

    // Load Footer
    try {
        const footerResponse = await fetch('../pages/footer.html');
        const footerHTML = await footerResponse.text();
        const footerContainer = document.getElementById('footer-placeholder');
        footerContainer.innerHTML = footerHTML;
        fixLinks(footerContainer, isInPages);
    } catch (error) {
        try {
            const footerResponse = await fetch('/pages/footer.html');
            const footerHTML = await footerResponse.text();
            document.getElementById('footer-placeholder').innerHTML = footerHTML;
        } catch(e) {
            console.error('Error loading footer:', e);
        }
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (currentPath === linkHref || 
            currentPath.endsWith(linkHref) ||
            (currentPath === '/' && linkHref === '/index.html') ||
            (currentPath === '/index.html' && linkHref === '/index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadComponents);
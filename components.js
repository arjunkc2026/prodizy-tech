// Load Navigation and Footer Components
async function loadComponents() {
    // Load Navigation
    try {
        const navResponse = await fetch('navbar.html');
        const navHTML = await navResponse.text();
        document.getElementById('navbar-placeholder').innerHTML = navHTML;
        
        // Initialize navbar functionality after it's loaded
        if (typeof initNavbar === 'function') {
            initNavbar();
        }
        
        // Set active link based on current page
        setActiveNavLink();
    } catch (error) {
        console.error('Error loading navigation:', error);
    }

    // Load Footer
    try {
        const footerResponse = await fetch('footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
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
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', loadComponents);
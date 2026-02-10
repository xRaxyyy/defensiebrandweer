// navbar.js - Automatisch geïnjecteerde navbar (oorspronkelijke stijl)
class Navbar extends HTMLElement {
    constructor() {
        super();
        this.currentPage = this.getCurrentPage();
        this.isMobileMenuOpen = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.updateActiveState();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('locaties.html')) return 'locations';
        if (path.includes('materieel.html')) return 'materieel';
        if (path.includes('dashboard.html')) return 'dashboard';
        return 'home';
    }

    render() {
        this.innerHTML = `
            <style>
                .navbar {
                    background: #1b263b;
                    color: white;
                    position: fixed;
                    top: 0;
                    width: 100%;
                    z-index: 1000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    border-bottom: 4px solid #dc2626;
                    font-family: 'oswald', sans-serif;
                }

                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .nav-content {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                .brand-icon {
                    background: #dc2626;
                    padding: 8px;
                    border-radius: 12px;
                    margin-right: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .brand-text {
                    font-size: 24px;
                    font-weight: 900;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }

                .brand-text span {
                    color: #dc2626;
                }

                .nav-links {
                    display: flex;
                    gap: 4px;
                }

                .nav-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-family: 'oswald', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: none;
                    border: none;
                    color: #d1d5db;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #dc2626;
                }

                .nav-btn.active {
                    background: #dc2626;
                    color: white;
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    padding: 10px;
                    cursor: pointer;
                }

                .mobile-menu {
                    display: none;
                    background: #1b263b;
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .mobile-nav-btn {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    text-align: left;
                    background: none;
                    border: none;
                    color: #d1d5db;
                    font-size: 16px;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .mobile-nav-btn:last-child {
                    border-bottom: none;
                }

                .mobile-nav-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #dc2626;
                }

                .mobile-nav-btn.active {
                    background: rgba(220, 38, 38, 0.2);
                    color: #dc2626;
                    border-left: 4px solid #dc2626;
                }

                @media (max-width: 768px) {
                    .nav-links {
                        display: none;
                    }

                    .mobile-menu-btn {
                        display: block;
                    }
                }

                @media (min-width: 769px) {
                    .mobile-menu {
                        display: none !important;
                    }
                }
            </style>

            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-content">
                        <div class="brand" onclick="window.location.href='index.html'">
                            <div class="brand-icon">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                            </div>
                            <div class="brand-text">
                                Defensiebrandweer <span>NL</span>
                            </div>
                        </div>

                        <div class="nav-links">
                            <button class="nav-btn ${this.currentPage === 'home' ? 'active' : ''}" data-page="home">
                                Welkom!
                            </button>
                            <button class="nav-btn ${this.currentPage === 'locations' ? 'active' : ''}" data-page="locations">
                                Locaties
                            </button>
                            <button class="nav-btn ${this.currentPage === 'materieel' ? 'active' : ''}" data-page="materieel">
                                Materieel
                            </button>
                            <button class="nav-btn ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                                Dashboard
                            </button>
                        </div>

                        <button class="mobile-menu-btn" id="mobileMenuBtn">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="${this.isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}" />
                            </svg>
                        </button>
                    </div>

                    <div class="mobile-menu" id="mobileMenu" style="display: ${this.isMobileMenuOpen ? 'block' : 'none'}">
                        <button class="mobile-nav-btn ${this.currentPage === 'home' ? 'active' : ''}" data-page="home">
                            Welkom!
                        </button>
                        <button class="mobile-nav-btn ${this.currentPage === 'locations' ? 'active' : ''}" data-page="locations">
                            Locaties
                        </button>
                        <button class="mobile-nav-btn ${this.currentPage === 'materieel' ? 'active' : ''}" data-page="materieel">
                            Materieel
                        </button>
                        <button class="mobile-nav-btn ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                            Dashboard
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    setupEventListeners() {
        // Desktop navigation
        this.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigateTo(page);
            });
        });

        // Mobile navigation
        this.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigateTo(page);
                this.closeMobileMenu();
            });
        });

        // Mobile menu toggle
        this.querySelector('#mobileMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target) && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    navigateTo(page) {
        // Map page names to URLs
        const pageMap = {
            'home': 'index.html',
            'locations': 'locaties.html',
            'materieel': 'materieel.html',
            'dashboard': 'dashboard.html'
        };
        
        const url = pageMap[page];
        if (url && url !== '#') {
            window.location.href = url;
        } else {
            this.currentPage = page;
            this.updateActiveState();
            this.closeMobileMenu();
        }
    }

    updateActiveState() {
        // Update desktop buttons
        this.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === this.currentPage);
        });

        // Update mobile buttons
        this.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === this.currentPage);
        });
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const mobileMenu = this.querySelector('#mobileMenu');
        const menuBtnIcon = this.querySelector('#mobileMenuBtn svg');
        
        if (mobileMenu) {
            mobileMenu.style.display = this.isMobileMenuOpen ? 'block' : 'none';
        }
        
        if (menuBtnIcon) {
            menuBtnIcon.innerHTML = this.isMobileMenuOpen ? 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' :
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
        }
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        const mobileMenu = this.querySelector('#mobileMenu');
        const menuBtnIcon = this.querySelector('#mobileMenuBtn svg');
        
        if (mobileMenu) {
            mobileMenu.style.display = 'none';
        }
        
        if (menuBtnIcon) {
            menuBtnIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
        }
    }
}

// Automatische injectie van de navbar
document.addEventListener('DOMContentLoaded', () => {
    // Verwijder bestaande navigatie
    const existingNav = document.querySelector('nav');
    if (existingNav && existingNav.parentElement && !existingNav.classList.contains('hero')) {
        existingNav.remove();
    }
    
    // Registreer custom element als het nog niet bestaat
    if (!customElements.get('defensie-navbar')) {
        customElements.define('defensie-navbar', Navbar);
    }
    
    // Injecteer de navbar bovenaan de body
    const navbarElement = document.createElement('defensie-navbar');
    document.body.insertBefore(navbarElement, document.body.firstChild);
    
    // Pas de hero sectie margin aan
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.marginTop = '80px';
    }
});
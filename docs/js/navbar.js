(function gateNavbarFonts() {
    if (!document.head || document.getElementById('defensie-navbar-gate')) return;
    const style = document.createElement('style');
    style.id = 'defensie-navbar-gate';
    style.textContent = 'defensie-navbar{visibility:hidden}html.defensie-fonts-ready defensie-navbar{visibility:visible}';
    document.head.appendChild(style);
    function reveal() { document.documentElement.classList.add('defensie-fonts-ready'); }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reveal);
        setTimeout(reveal, 2500);
    } else {
        reveal();
    }
})();

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
        if (path.includes('fotogalerij')) return 'gallery';
        if (path.includes('locatie-detail')) return 'locations';
        if (path.includes('locaties')) return 'locations';
        if (path.includes('/materieel/') && !path.endsWith('materieel')) return 'materieel-sub';
        if (path.includes('materieel')) return 'materieel';
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('voertuig-detail')) return 'voertuigen';
        if (path.includes('voertuigen')) return 'voertuigen';
        if (path.includes('kenteken')) return 'kenteken-register';
        if (path.includes('luchthavenbrandweer')) return 'luchthavenbrandweer';
        if (path.includes('afkortingen')) return 'afkortingen';
        if (path.includes('historie')) return 'historie';
        if (path.includes('over-ons')) return 'over-ons';
        if (path.includes('contact')) return 'contact';
        return 'home';
    }

    rootPrefix() {
        const path = window.location.pathname;
        if (path.includes('/materieel/fotopagina/')) return '../../';
        if (path.includes('/materieel/')) return '../';
        return '';
    }

    getCurrentTopic() {
        const url = new URL(window.location.href);
        const segments = url.pathname.split('/').filter(Boolean);
        const path = segments.slice(-2).join('/');
        if (segments.includes('materieel') && segments[segments.length - 1] !== 'materieel') return 'materieel/' + segments[segments.length - 1];
        const zoek = url.searchParams.get('zoek');
        if (zoek) return zoek;
        return segments[segments.length - 1] || '';
    }

    render() {
        window.DefensieNavbarRoot = this.rootPrefix();
        this.innerHTML = `
            <style>
                .navbar { background: rgba(12, 14, 9, 0.94); backdrop-filter: blur(10px); position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
                .nav-accent { position: relative; width: 100%; height: 6px; display: flex; pointer-events: none; }
                .nav-accent span:nth-child(1) { flex: 2; background: #D92D0B; }
                .nav-accent span:nth-child(2) { flex: 1; background: #F0AE4A; }
                .nav-accent span:nth-child(3) { flex: 1; background: #1F4FE0; }
                .nav-container { max-width: 1280px; margin: 0 auto; padding: 10px 48px; }
                .nav-content { display: flex; align-items: center; justify-content: space-between; height: 50px; }
                .brand { display: flex; align-items: center; gap: 14px; min-width: 0; text-decoration: none; }
                .brand-logo-img { height: 50px; width: auto; display: block; flex: 0 0 auto; border-radius: 50%; }
                .brand-text { display: flex; flex-direction: column; gap: 4px; line-height: 1; min-width: 0; }
                .brand-name-top { color: var(--gold, #F0AE4A); font: 600 12px 'Barlow', sans-serif; letter-spacing: .3em; text-transform: uppercase; }
                .brand-name-bottom { color: #EDEFE6; font: 700 28px/1 'Barlow Condensed', sans-serif; letter-spacing: .05em; text-transform: uppercase; }
                .nav-links { display: flex; align-items: center; gap: 2px; height: 100%; }
                .nav-btn { position: relative; display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; background: none; border: 1px solid transparent; border-radius: 4px; font-size: 14px; font-weight: 600; letter-spacing: .01em; color: #B9BFAE; cursor: pointer; transition: color .2s, background-color .2s, border-color .2s; font-family: inherit; }
                .nav-btn:hover { color: #EDEFE6; background: #1E2417; border-color: #3A4130; }
                .nav-dropdown:hover > .nav-btn:not(.active),
                .nav-dropdown.open > .nav-btn:not(.active),
                .nav-dropdown:focus-within > .nav-btn:not(.active) { color: #EDEFE6; background: #1E2417; border-color: #3A4130; }
                .nav-btn.active { color: #fff; background: #1F4FE0; border-color: #1F4FE0; }
                .nav-btn .caret { font-size: 10px; line-height: 1; height: 1em; display: inline-flex; align-items: center; justify-content: center; opacity: .6; transition: transform .2s; transform-origin: 50% 50%; }
                .nav-btn.active .caret { opacity: 1; }
                .nav-dropdown { position: relative; display: flex; align-items: center; align-self: stretch; }
                .nav-sep { width: 1px; height: 20px; align-self: center; background: #3A4130; margin: 0 10px; }
                .nav-dropdown.open .nav-btn .caret,
                .nav-dropdown:hover .nav-btn .caret { transform: rotate(180deg); }
                .dropdown-panel {
                    position: absolute;
                    top: calc(100% + 20px);
                    left: 50%;
                    transform: translateX(-50%) translateY(-4px);
                    min-width: 220px;
                    background: #1E2417;
                    border: 1px solid #3A4130;
                    border-radius: 6px;
                    box-shadow: 0 16px 40px rgba(0,0,0,.4);
                    padding: 8px;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity .2s, visibility .2s, transform .2s;
                    z-index: 1001;
                }
                .nav-dropdown::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    height: 22px;
                }
                .nav-dropdown.open .dropdown-panel,
                .nav-dropdown:hover .dropdown-panel {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                }
                .drop-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 14px;
                    border: none;
                    background: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #D3D8C8;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all .2s;
                    text-align: left;
                }
                .drop-item:hover { color: #EDEFE6; background: #2F3A25; }
                .drop-item.active { color: #fff; background: #1F4FE0; }
                .drop-sep { height: 1px; background: #3A4130; margin: 6px 4px; }
                .drop-has-sub { position: relative; }
                .flyout {
                    position: absolute;
                    top: 0;
                    left: 100%;
                    min-width: 220px;
                    background: #1E2417;
                    border: 1px solid #3A4130;
                    border-radius: 6px;
                    box-shadow: 0 16px 40px rgba(0,0,0,.4);
                    padding: 8px;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity .2s, visibility .2s, transform .2s;
                    transform: translateX(-6px);
                    z-index: 1002;
                }
                .drop-has-sub:hover .flyout { opacity: 1; visibility: visible; transform: translateX(0); }
                .mobile-menu-btn { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: #EDEFE6; }
                .mobile-menu { display: none; }
                .mobile-group-label { padding: 16px 20px 6px; font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #7C8570; }
                .mobile-nav-btn { display: block; width: 100%; padding: 13px 20px; background: none; border: none; border-bottom: 1px solid #2A3022; text-align: left; font-size: 15px; font-weight: 500; color: #B9BFAE; cursor: pointer; font-family: inherit; transition: color .18s, background-color .18s; }
                .mobile-nav-btn:hover { background: #1E2417; color: #EDEFE6; }
                .mobile-nav-btn.active { color: #fff; background: #1F4FE0; }
                .brand:focus-visible, .navbar button:focus-visible { outline: 2px solid #F0AE4A; outline-offset: 2px; }
                @media (max-width: 1024px) {
                    .nav-container { padding: 10px 28px; }
                    .nav-btn { padding: 10px 12px; font-size: 13px; }
                    .nav-sep { margin: 0 6px; }
                }
                @media (max-width: 940px) {
                    .nav-container { padding: 10px 20px; }
                    .brand-logo-img { height: 40px; }
                    .brand-text { gap: 3px; }
                    .brand-name-top { font-size: 10px; letter-spacing: .26em; }
                    .brand-name-bottom { font-size: 20px; }
                    .nav-links { display: none; }
                    .mobile-menu-btn { display: block; }
                    .mobile-menu { display: block; position: absolute; top: 76px; left: 0; right: 0; max-height: calc(100vh - 76px); overflow-y: auto; background: #1E2417; border-bottom: 1px solid #3A4130; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .navbar *, .navbar *::before, .navbar *::after { transition-duration: .01ms !important; }
                }
            </style>

            <nav class="navbar">
                <div class="nav-container">                    <div class="nav-content">
                        <a class="brand" href="${this.rootPrefix()}index">
                            <img class="brand-logo-img" src="${this.rootPrefix()}assets/logo-rond.jpg" alt="Logo Defensiebrandweer NL">
                            <span class="brand-text">
                                <span class="brand-name-top">DEFENSIE</span>
                                <span class="brand-name-bottom">BRANDWEER NL</span>
                            </span>
                        </a>
                        <div class="nav-links">
                            <button class="nav-btn ${this.currentPage === 'locations' ? 'active' : ''}" data-page="locations">Locaties</button>
                            <div class="nav-dropdown">
                                <button class="nav-btn ${['voertuigen', 'kenteken-register', 'luchthavenbrandweer'].includes(this.currentPage) ? 'active' : ''}" data-page="voertuigen">
                                    Voertuigen <i class="fi fi-rr-angle-small-down caret"></i>
                                </button>
                                <div class="dropdown-panel" id="rollendDropdown">
                                    <button class="drop-item ${this.currentPage === 'voertuigen' ? 'active' : ''}" data-page="voertuigen"><i class="fi fi-rr-truck-moving"></i> Voertuigen</button>
                                    <button class="drop-item ${this.currentPage === 'kenteken-register' ? 'active' : ''}" data-page="kenteken-register"><i class="fi fi-rr-file"></i> Kentekenregister</button>
                                    <button class="drop-item ${this.currentPage === 'luchthavenbrandweer' ? 'active' : ''}" data-page="luchthavenbrandweer"><i class="fi fi-rr-plane"></i> Luchthavenbrandweer</button>
                                </div>
                            </div>
                            <div class="nav-dropdown">
                                <button class="nav-btn ${this.currentPage === 'materieel' ? 'active' : ''}" data-page="materieel">
                                    Materieel <i class="fi fi-rr-angle-small-down caret"></i>
                                </button>
                                <div class="dropdown-panel" id="matDropdown">
                                    <button class="drop-item" data-page="materieel">Materieellijst</button>
                                    <div class="drop-sep"></div>
                                    <button class="drop-item" data-topic="materieel/ademluchtapparatuur">Ademluchtapparatuur</button>
                                    <button class="drop-item" data-topic="materieel/armaturen">Armaturen water &amp; schuim</button>
                                    <button class="drop-item" data-topic="materieel/blusmiddelen">Blusmiddelen</button>
                                    <div class="drop-sep"></div>
                                    <button class="drop-item" data-topic="materieel/brandweerkleding">Brandweerkleding</button>
                                    <button class="drop-item" data-topic="materieel/leveranciers">Leveranciers / Bedrijven</button>

                                </div>
                            </div>
                            <div class="nav-dropdown">
                                <button class="nav-btn ${['gallery', 'afkortingen', 'historie'].includes(this.currentPage) ? 'active' : ''}" data-page="gallery">
                                    Kennisbank <i class="fi fi-rr-angle-small-down caret"></i>
                                </button>
                                <div class="dropdown-panel" id="kennisDropdown">
                                    <button class="drop-item ${this.currentPage === 'gallery' ? 'active' : ''}" data-page="gallery"><i class="fi fi-rr-gallery"></i> Fotogalerij</button>
                                    <button class="drop-item ${this.currentPage === 'afkortingen' ? 'active' : ''}" data-page="afkortingen"><i class="fi fi-rr-book"></i> Afkortingen</button>
                                    <button class="drop-item ${this.currentPage === 'historie' ? 'active' : ''}" data-page="historie"><i class="fi fi-rr-time-past"></i> Historie</button>
                                </div>
                            </div>
                            <div class="nav-dropdown">
                                <button class="nav-btn ${this.currentPage === 'over-ons' || this.currentPage === 'contact' ? 'active' : ''}" data-page="over-ons">
                                    Over ons <i class="fi fi-rr-angle-small-down caret"></i>
                                </button>
                                <div class="dropdown-panel" id="overOnsDropdown">
                                    <button class="drop-item ${this.currentPage === 'over-ons' ? 'active' : ''}" data-page="over-ons"><i class="fi fi-rr-users"></i> Over ons</button>
                                    <button class="drop-item ${this.currentPage === 'contact' ? 'active' : ''}" data-page="contact"><i class="fi fi-rr-envelope"></i> Contact</button>
                                </div>
                            </div>
                            <span class="nav-sep" aria-hidden="true"></span>
                            <button class="nav-btn ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">Dashboard</button>
                        </div>
                        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu" aria-expanded="${this.isMobileMenuOpen}">
                            <i class="fi fi-rr-${this.isMobileMenuOpen ? 'cross' : 'menu-burger'}"></i>
                        </button>
                    </div>
                    <div class="mobile-menu" id="mobileMenu" style="display: ${this.isMobileMenuOpen ? 'block' : 'none'}">
                        <div class="mobile-group-label">Collectie</div>
                        <button class="mobile-nav-btn ${this.currentPage === 'locations' ? 'active' : ''}" data-page="locations">Locaties</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'voertuigen' ? 'active' : ''}" data-page="voertuigen">Voertuigen</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'materieel' ? 'active' : ''}" data-page="materieel">Materieel</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'kenteken-register' ? 'active' : ''}" data-page="kenteken-register">Kentekenregister</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'luchthavenbrandweer' ? 'active' : ''}" data-page="luchthavenbrandweer">Luchthavenbrandweer</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'gallery' ? 'active' : ''}" data-page="gallery">Fotogalerij</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'afkortingen' ? 'active' : ''}" data-page="afkortingen">Afkortingen</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'historie' ? 'active' : ''}" data-page="historie">Historie</button>
                        <div class="mobile-group-label">Overig</div>
                        <button class="mobile-nav-btn ${this.currentPage === 'over-ons' ? 'active' : ''}" data-page="over-ons">Over ons</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'contact' ? 'active' : ''}" data-page="contact">Contact</button>
                        <button class="mobile-nav-btn ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">Dashboard</button>
                    </div>
                </div>
                <div class="nav-accent" aria-hidden="true"><span></span><span></span><span></span></div>
            </nav>
        `;
    }

    setupEventListeners() {
        const desktopBtns = this.querySelectorAll('.nav-links .nav-btn');
        const mobileBtns = this.querySelectorAll('.mobile-nav-btn');
        const mobileMenuBtn = this.querySelector('#mobileMenuBtn');

        desktopBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.closest('.nav-dropdown') && !e.target.closest('.dropdown-panel')) {
                    const wrap = btn.closest('.nav-dropdown');
                    if (window.innerWidth > 940 && e.target.closest('.nav-btn') && !wrap.classList.contains('open')) {
                        if (matchMedia('(hover: none)').matches) {
                            e.preventDefault();
                            wrap.classList.add('open');
                            return;
                        }
                    }
                }
                e.preventDefault();
                const page = btn.dataset.page;
                this.navigateTo(page);
            });
        });

        this.querySelectorAll('.dropdown-panel .drop-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = item.dataset.page;
                this.closeMobileMenu();
                const slug = { 'home':'index','locations':'locaties','materieel':'materieel','voertuigen':'voertuigen','gallery':'fotogalerij','dashboard':'dashboard','afkortingen':'afkortingen','historie':'historie','luchthavenbrandweer':'luchthavenbrandweer','kenteken-register':'kenteken-register','over-ons':'over-ons','contact':'contact' }[page];
                if (slug) window.location.href = this.rootPrefix() + slug;
            });
        });

        this.querySelectorAll('[data-mat]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const q = item.dataset.mat;
                this.closeMobileMenu();
                const base = `${this.rootPrefix()}materieel`;
                window.location.href = q === 'all' ? base : `${base}?zoek=${encodeURIComponent(q)}`;
            });
        });

        this.querySelectorAll('[data-topic]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeMobileMenu();
                let t = item.dataset.topic;
                if (t.startsWith('materieel/')) t = this.rootPrefix() + t;
                window.location.href = t;
            });
        });

        mobileBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                this.navigateTo(page);
                this.closeMobileMenu();
            });
        });

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        document.addEventListener('click', (e) => {
            if (!this.contains(e.target) && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    navigateTo(page) {
        const pageMap = {
            'home': 'index',
            'locations': 'locaties',
            'materieel': 'materieel',
            'voertuigen': 'voertuigen',
            'gallery': 'fotogalerij',
            'dashboard': 'dashboard',
            'afkortingen': 'afkortingen',
            'historie': 'historie',
            'luchthavenbrandweer': 'luchthavenbrandweer',
            'kenteken-register': 'kenteken-register',
            'over-ons': 'over-ons',
            'contact': 'contact'
        };
        const slug = pageMap[page];
        if (slug) window.location.href = this.rootPrefix() + slug;
    }

    updateActiveState() {
        const groups = {
            'voertuigen': ['voertuigen', 'kenteken-register', 'luchthavenbrandweer'],
            'gallery': ['gallery', 'afkortingen', 'historie'],
            'over-ons': ['over-ons', 'contact']
        };
        this.querySelectorAll('.nav-links .nav-btn').forEach(btn => {
            let isActive = btn.dataset.page === this.currentPage;
            const group = groups[btn.dataset.page];
            if (group && group.includes(this.currentPage)) isActive = true;
            if (isActive) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            const isActive = btn.dataset.page === this.currentPage;
            if (isActive) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.querySelectorAll('.dropdown-panel .drop-item').forEach(item => {
            const isActive = item.dataset.page === this.currentPage || item.dataset.mat === this.getCurrentTopic() || item.dataset.topic === this.getCurrentTopic();
            if (isActive) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const mobileMenu = this.querySelector('#mobileMenu');
        const mobileMenuBtn = this.querySelector('#mobileMenuBtn');
        const menuBtnIcon = this.querySelector('#mobileMenuBtn i');
        if (mobileMenu) mobileMenu.style.display = this.isMobileMenuOpen ? 'block' : 'none';
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', String(this.isMobileMenuOpen));
        if (menuBtnIcon) menuBtnIcon.className = `fi fi-rr-${this.isMobileMenuOpen ? 'cross' : 'menu-burger'}`;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        const mobileMenu = this.querySelector('#mobileMenu');
        const mobileMenuBtn = this.querySelector('#mobileMenuBtn');
        const menuBtnIcon = this.querySelector('#mobileMenuBtn i');
        if (mobileMenu) mobileMenu.style.display = 'none';
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (menuBtnIcon) menuBtnIcon.className = 'fi fi-rr-menu-burger';
    }
}

if (!customElements.get('defensie-navbar')) {
    customElements.define('defensie-navbar', Navbar);
}

function mountNavbar() {
    if (document.querySelector('defensie-navbar') || !document.body) return false;
    const navbarElement = document.createElement('defensie-navbar');
    document.body.insertBefore(navbarElement, document.body.firstChild);
    return true;
}

(function gateNavbarFonts() {
    // already defined above
})();

if (!mountNavbar()) {
    const navbarObserver = new MutationObserver(() => {
        if (mountNavbar()) navbarObserver.disconnect();
    });
    navbarObserver.observe(document.documentElement, { childList: true, subtree: true });
}
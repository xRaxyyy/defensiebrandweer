// Reserve footer space while <head> is still parsing, so the late-mounted
// footer never shifts page layout when it replaces its placeholder.
(function prepareFooterShell() {
    if (!document.head || document.getElementById('defensie-footer-shell')) return;
    const style = document.createElement('style');
    style.id = 'defensie-footer-shell';
    style.textContent = `
        #footer-placeholder { display: block; min-height: 420px; background: #0C0E09; }
        @media (max-width: 768px) { #footer-placeholder { min-height: 1000px; } }
    `;
    document.head.appendChild(style);
})();

class Footer extends HTMLElement {
    constructor() { super(); }

    connectedCallback() { this.render(); }

    rootPrefix() {
        const path = window.location.pathname;
        if (path.includes('/materieel/fotopagina/')) return '../../';
        if (path.includes('/materieel/')) return '../';
        return '';
    }

    render() {
        const root = this.rootPrefix();
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
            <style>
                .footer { position: relative; background: #0B0D08; color: #B9BFAE; border-top: 1px solid #2A3022; font: 400 15px/1.65 'Barlow', sans-serif; padding: 56px 0 24px; margin-top: 0; }
                .footer::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #DC2626, #F0AE4A 45%, transparent 85%); opacity: .55; }
                .footer-container { max-width: 1280px; margin: 0 auto; padding: 0 48px; }
                .footer-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) repeat(3, minmax(0, 1fr)); gap: 48px 40px; }
                .footer-grid > div { min-width: 0; }
                .brand-column { display: block; }
                .brand-lockup { display: inline-flex; align-items: center; gap: 14px; text-decoration: none; }
                .footer-logo { height: 56px; width: auto; display: block; flex: 0 0 auto; border-radius: 50%; }
                .footer-brand-text { display: flex; flex-direction: column; gap: 4px; line-height: 1; }
                .footer-brand-top { color: #F0AE4A; font: 600 12px 'Barlow', sans-serif; letter-spacing: .3em; text-transform: uppercase; }
                .footer-brand-bottom { color: #EDEFE6; font: 700 26px/1 'Barlow Condensed', sans-serif; letter-spacing: .05em; text-transform: uppercase; }
                .brand-tagline { margin: 18px 0 0; max-width: 360px; color: #87907A; font-size: 14px; line-height: 1.65; }
                .disclaimer-box { margin-top: 16px; max-width: 360px; padding: 14px 16px; background: rgba(240, 174, 74, .05); border: 1px solid rgba(240, 174, 74, .22); border-left: 3px solid #F0AE4A; border-radius: 5px; }
                .disclaimer-title { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; color: #F0AE4A; font: 700 11px/1 'Barlow', sans-serif; letter-spacing: .14em; text-transform: uppercase; }
                .disclaimer-title i { font-size: 13px; display: inline-flex; }
                .disclaimer-title i::before { line-height: 1; margin: 0; display: block; }
                .disclaimer-text { margin: 0; color: #B9BFAE; font-size: 13.5px; line-height: 1.6; }
                .disclaimer-text strong { color: #EDEFE6; }
                .footer .section-title { margin: 0 0 12px; padding-bottom: 10px; border-bottom: 1px solid #2A3022; color: #EDEFE6; font: 700 13px 'Barlow', sans-serif; letter-spacing: .14em; text-transform: uppercase; }
                .nav-list { list-style: none; margin: 0 -10px; padding: 0; display: flex; flex-direction: column; gap: 2px; }
                .nav-item { margin: 0; min-width: 0; }
                .nav-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border-radius: 4px; color: #C7CDBB; font: 500 14.5px 'Barlow', sans-serif; text-decoration: none; overflow-wrap: anywhere; transition: background-color 150ms, color 150ms; }
                .nav-link i { width: 18px; flex: 0 0 18px; font-size: 13px; color: #87907A; display: inline-flex; align-items: center; justify-content: center; transition: color 150ms; }
                .nav-link i::before { line-height: 1; margin: 0; display: block; }
                .nav-link:hover, .nav-link:focus-visible { background: #1E2417; color: #fff; }
                .nav-link:hover i, .nav-link:focus-visible i { color: #F0AE4A; }
                .nav-link[href^="mailto:"] { align-items: flex-start; }
                .nav-link[href^="mailto:"] i { margin-top: 2px; }
                .follow-block { margin-top: 28px; }
                .social-links { display: flex; flex-wrap: wrap; gap: 8px; }
                .social-btn { width: 38px; height: 38px; border-radius: 4px; background: #1E2417; border: 1px solid #2A3022; color: #B9BFAE; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; transition: background-color 150ms, color 150ms, border-color 150ms; }
                .social-btn:hover, .social-btn:focus-visible { background: #F0AE4A; border-color: #F0AE4A; color: #14170F; }
                .social-btn i { font-size: 16px; line-height: 1; display: inline-flex; }
                .social-btn i::before { line-height: 1; margin: 0; display: block; }
                .footer-bottom { margin-top: 44px; padding-top: 20px; border-top: 1px solid #2A3022; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
                .copyright { color: #87907A; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; }
                .copyright i { color: #F0AE4A; display: inline-flex; }
                .copyright i::before { line-height: 1; margin: 0; display: block; }
                .bottom-links { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin: 0 -10px; }
                .bottom-link { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 4px; color: #A9B09D; font: 500 13px 'Barlow', sans-serif; text-decoration: none; transition: background-color 150ms, color 150ms; }
                .bottom-link i { font-size: 12px; color: #87907A; display: inline-flex; align-items: center; transition: color 150ms; }
                .bottom-link i::before { line-height: 1; margin: 0; display: block; }
                .bottom-link:hover, .bottom-link:focus-visible { background: #1E2417; color: #FFD078; }
                .bottom-link:hover i, .bottom-link:focus-visible i { color: #FFD078; }
                .footer :focus-visible { outline: 2px solid #F0AE4A; outline-offset: 2px; }
                @media (max-width: 1080px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px 32px; } .footer-container { padding: 0 32px; } }
                @media (max-width: 768px) { .footer { padding: 44px 0 24px; } .footer-container { padding: 0 20px; } .footer-grid { grid-template-columns: 1fr; gap: 36px; } .brand-tagline, .disclaimer-box { max-width: none; } .footer-bottom { flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 36px; } }
                @media (max-width: 480px) { .bottom-links { flex-direction: column; align-items: flex-start; gap: 4px; } }
                @media (prefers-reduced-motion: reduce) { .footer *, .footer *::before, .footer *::after { transition-duration: .01ms !important; animation: none !important; } }
            </style>
            <div class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="brand-column">
                            <a class="brand-lockup" href="${root}index">
                                <img class="footer-logo" src="${root}assets/logo-rond.jpg" alt="Logo Defensiebrandweer NL">
                                <span class="footer-brand-text">
                                    <span class="footer-brand-top">DEFENSIE</span>
                                    <span class="footer-brand-bottom">BRANDWEER NL</span>
                                </span>
                            </a>
                            <p class="brand-tagline">Het complete overzicht van kazernes, voertuigen en materieel van de Nederlandse militaire brandweer.</p>
                            <div class="disclaimer-box">
                                <div class="disclaimer-title"><i class="fi fi-rr-info"></i> Particulier initiatief</div>
                                <p class="disclaimer-text">Geen officiële website van het <strong>Ministerie van Defensie</strong>. Alle informatie wordt met zorg samengesteld.</p>
                            </div>
                        </div>
                        <div>
                            <h3 class="section-title">Navigatie</h3>
                            <ul class="nav-list">
                                <li class="nav-item"><a href="${root}index" class="nav-link"><i class="fi fi-rr-home"></i> Home</a></li>
                                <li class="nav-item"><a href="${root}locaties" class="nav-link"><i class="fi fi-rr-marker"></i> Locaties</a></li>
                                <li class="nav-item"><a href="${root}voertuigen" class="nav-link"><i class="fi fi-rr-truck-moving"></i> Voertuigen</a></li>
                                <li class="nav-item"><a href="${root}materieel" class="nav-link"><i class="fi fi-rr-tools"></i> Materieel</a></li>
                                <li class="nav-item"><a href="${root}dashboard" class="nav-link"><i class="fi fi-rr-dashboard"></i> Dashboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="section-title">Snel naar</h3>
                            <ul class="nav-list">
                                <li class="nav-item"><a href="${root}afkortingen" class="nav-link"><i class="fi fi-rr-book"></i> Afkortingen</a></li>
                                <li class="nav-item"><a href="${root}kenteken-register" class="nav-link"><i class="fi fi-rr-file"></i> Kentekenregister</a></li>
                                <li class="nav-item"><a href="${root}fotogalerij" class="nav-link"><i class="fi fi-rr-gallery"></i> Fotogalerij</a></li>
                                <li class="nav-item"><a href="${root}historie" class="nav-link"><i class="fi fi-rr-time-past"></i> Historie</a></li>
                                <li class="nav-item"><a href="${root}contact" class="nav-link"><i class="fi fi-rr-shield"></i> Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="section-title">Contact</h3>
                            <ul class="nav-list">
                                <li class="nav-item"><a href="${root}contact" class="nav-link"><i class="fi fi-rr-shield"></i> Contactpagina</a></li>
                                <li class="nav-item"><a href="mailto:info@defensiebrandweer.nl" class="nav-link"><i class="fi fi-rr-envelope"></i> info@defensiebrandweer.nl</a></li>
                            </ul>
                            <div class="follow-block">
                                <h3 class="section-title">Volg ons</h3>
                                <div class="social-links">
                                    <a href="#" class="social-btn" aria-label="Facebook"><i class="fi fi-brands-facebook"></i></a>
                                    <a href="#" class="social-btn" aria-label="Instagram"><i class="fi fi-brands-instagram"></i></a>
                                    <a href="#" class="social-btn" aria-label="LinkedIn"><i class="fi fi-brands-linkedin"></i></a>
                                    <a href="#" class="social-btn" aria-label="YouTube"><i class="fi fi-brands-youtube"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="copyright">
                            <i class="fi fi-rr-flame"></i> &copy; ${currentYear} Defensiebrandweer NL
                        </div>
                        <div class="bottom-links">
                            <a href="${root}privacybeleid" class="bottom-link"><i class="fi fi-rr-lock"></i> Privacybeleid</a>
                            <a href="${root}disclaimer" class="bottom-link"><i class="fi fi-rr-file"></i> Disclaimer</a>
                            <a href="${root}credits" class="bottom-link"><i class="fi fi-rr-heart"></i> Credits</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        try {
            if (window.location.pathname.includes('/materieel/')) {
                this.querySelectorAll('a[href]').forEach(a => {
                    const href = a.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('../') && !href.startsWith('/')) {
                        a.setAttribute('href', '../' + href);
                    }
                });
            }
        } catch (e) {}
    }
}

if (!customElements.get('defensie-footer')) {
    customElements.define('defensie-footer', Footer);
}

function mountFooter() {
    if (document.querySelector('defensie-footer')) return true;
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return false;
    const footerElement = document.createElement('defensie-footer');
    placeholder.replaceWith(footerElement);
    return true;
}

function mountFooterFallback() {
    if (document.querySelector('defensie-footer')) return;
    const footerElement = document.createElement('defensie-footer');
    const scrollContent = document.querySelector('.scroll-content');
    if (scrollContent) {
        scrollContent.appendChild(footerElement);
    } else if (document.body) {
        document.body.appendChild(footerElement);
    }
}

(function prepareFooterShell() {
    if (!document.head || document.getElementById('defensie-footer-shell')) return;
    const style = document.createElement('style');
    style.id = 'defensie-footer-shell';
    style.textContent = `
        #footer-placeholder { display: block; min-height: 420px; background: #0C0E09; }
        @media (max-width: 768px) { #footer-placeholder { min-height: 1000px; } }
    `;
    document.head.appendChild(style);
})();

if (!mountFooter()) {
    const footerObserver = new MutationObserver(() => {
        if (mountFooter()) footerObserver.disconnect();
    });
    footerObserver.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(mountFooterFallback, 1000);
}
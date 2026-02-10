// footer.js - Automatisch geïnjecteerde footer
class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const currentYear = new Date().getFullYear();
        
        this.innerHTML = `
            <style>
                .footer {
                    background: #1b263b;
                    color: #9ca3af;
                    padding: 80px 0;
                    border-top: 12px solid #dc2626;
                    font-family: 'Inter', sans-serif;
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 60px;
                    margin-bottom: 60px;
                }

                .brand-column {
                    grid-column: span 2;
                }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .brand-icon {
                    background: #dc2626;
                    padding: 8px;
                    border-radius: 12px;
                    margin-right: 16px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }

                .brand-text {
                    font-size: 32px;
                    font-weight: 900;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: -1px;
                }

                .brand-text span {
                    color: #dc2626;
                }

                .disclaimer-box {
                    margin-bottom: 30px;
                    padding: 20px 0;
                }

                .disclaimer-label {
                    color: #dc2626;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 3px;
                    margin-bottom: 8px;
                }

                .disclaimer-text {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #9ca3af;
                    max-width: 400px;
                }

                .disclaimer-text strong {
                    color: white;
                }

                .language-selector {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .language-selector:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .flag {
                    width: 24px;
                    height: 16px;
                    border-radius: 3px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .language-text {
                    color: white;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 2px;
                }

                .footer .section-title {
                    color: white;
                    font-family: 'oswald', sans-serif;
                    font-size: 12px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 30px;
                    padding-left: 16px;
                    border-left: 4px solid #dc2626;
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .nav-item {
                    margin-bottom: 16px;
                }

                .nav-link {
                    color: #6b7280;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-decoration: none;
                    transition: all 0.3s;
                    display: inline-block;
                }

                .nav-link:hover {
                    color: white;
                    transform: translateX(8px);
                }

                .nav-link.special {
                    color: #dc2626;
                }

                .contact-item {
                    margin-bottom: 30px;
                }

                .contact-label {
                    color: #6b7280;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }

                .contact-value {
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .contact-value:hover {
                    color: #dc2626;
                }

                .social-links {
                    display: flex;
                    gap: 12px;
                }

                .social-btn {
                    background: rgba(255, 255, 255, 0.05);
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 1px;
                    text-decoration: none;
                    transition: all 0.3s;
                }

                .social-btn:hover {
                    background: #dc2626;
                    color: white;
                    transform: translateY(-2px);
                }

                .footer-bottom {
                    padding-top: 40px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .copyright {
                    color: #6b7280;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 2px;
                }

                .bottom-links {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                }

                .bottom-link {
                    color: #6b7280;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .bottom-link:hover {
                    color: white;
                }

                .live-badge {
                    display: flex;
                    align-items: center;
                    color: #dc2626;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 2px;
                }

                .live-dot {
                    width: 8px;
                    height: 8px;
                    background: #dc2626;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .brand-column {
                        grid-column: span 2;
                    }
                }

                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    
                    .brand-column {
                        grid-column: span 1;
                    }
                    
                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            </style>

            <div class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <!-- Brand Column -->
                        <div class="brand-column">
                            <div class="brand-logo">
                                <div class="brand-icon">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" 
                                              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    </svg>
                                </div>
                                <div class="brand-text">
                                    Defensiebrandweer <span>NL</span>
                                </div>
                            </div>
                            
                            <div class="disclaimer-box">
                                <div class="disclaimer-label">Onofficieel Platform</div>
                                <div class="disclaimer-text">
                                    Deze website is een particulier initiatief en heeft <strong>GEEN</strong> officiële status en is <strong>GEEN</strong> onderdeel van het Nederlandse Ministerie van Defensie.
                                </div>
                            </div>

                            <div class="language-selector" id="languageToggle">
                                <div class="flag">
                                    <svg viewBox="0 0 60 30">
                                        <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                                        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/>
                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/>
                                        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" clipPath="url(#s)"/>
                                        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#s)"/>
                                    </svg>
                                </div>
                                <span class="language-text">English version</span>
                            </div>
                        </div>

                        <!-- Navigation Column -->
                        <div>
                            <h3 class="section-title">Navigatie</h3>
                            <ul class="nav-list">
                                <li class="nav-item"><a href="index.html" class="nav-link">Welkom</a></li>
                                <li class="nav-item"><a href="locaties.html" class="nav-link">Locatie Database</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">Materieel Register</a></li>
                                <li class="nav-item"><a href="#" class="nav-link">Kenteken Register</a></li>
                                <li class="nav-item"><a href="#" class="nav-link special">Credits Pagina</a></li>
                            </ul>
                        </div>

                        <!-- Contact Column -->
                        <div>
                            <h3 class="section-title">Interactie</h3>
                            <div class="contact-item">
                                <div class="contact-label">Heeft u kopij of foto's?</div>
                                <a href="mailto:info@defensiebrandweer.nl" class="contact-value">info@defensiebrandweer.nl</a>
                            </div>
                            <div class="contact-item">
                                <div class="contact-label">Social Media</div>
                                <div class="social-links">
                                    <a href="#" class="social-btn">FB</a>
                                    <a href="#" class="social-btn">IG</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <div class="copyright">
                            &copy; ${currentYear} DEFENSIEBRANDWEER NL • SEMPER PARATUS
                        </div>
                        <div class="bottom-links">
                            <a href="#" class="bottom-link">Privacybeleid</a>
                            <a href="#" class="bottom-link">Disclaimer</a>
                            <div class="live-badge">
                                <div class="live-dot"></div>
                                LIVE ARCHIEF
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Language toggle
        const languageToggle = this.querySelector('#languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                alert('English version coming soon!');
            });
        }

        // Smooth scroll for anchor links
        this.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // External link confirmation
        this.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.getAttribute('href').includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
}

// Automatische injectie - dit is het belangrijkste deel!
document.addEventListener('DOMContentLoaded', () => {
    // Controleer of er al een footer bestaat
    if (!document.querySelector('defensie-footer')) {
        // Maak het custom element aan
        customElements.define('defensie-footer', Footer);
        
        // Creëer en injecteer de footer
        const footerElement = document.createElement('defensie-footer');
        document.body.appendChild(footerElement);
    }
});
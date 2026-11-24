const DefensieModal = (() => {
    let overlay = null;
    let closeButton = null;
    let lastFocus = null;

    function ensure() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'defensieImageModal';
        overlay.className = 'defensie-modal-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="defensie-modal-content" role="dialog" aria-modal="true" aria-label="Afbeelding">
                <button class="defensie-modal-close" type="button" aria-label="Sluiten"><i class="fas fa-times"></i></button>
                <img class="defensie-modal-image" alt="">
            </div>`;
        document.body.appendChild(overlay);
        closeButton = overlay.querySelector('.defensie-modal-close');
        const image = overlay.querySelector('.defensie-modal-image');
        closeButton.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
        return overlay;
    }

    function open(src, alt) {
        ensure();
        lastFocus = document.activeElement;
        const image = overlay.querySelector('.defensie-modal-image');
        image.src = src;
        image.alt = alt || '';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('defensie-modal-active');
        if (!overlay.classList.contains('open')) {
            void overlay.offsetWidth;
            overlay.classList.add('open');
        }
        requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
    }

    function close() {
        if (!overlay || !overlay.classList.contains('open')) return;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('defensie-modal-active');
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
        }
    }

    const style = document.createElement('style');
    style.id = 'defensie-modal-style';
    style.textContent = `
        .defensie-modal-overlay {
            position: fixed; inset: 0; z-index: 999;
            display: flex; align-items: center; justify-content: center;
            background: rgba(8,10,7,.88);
            opacity: 0; visibility: hidden; pointer-events: none;
            transition: opacity 230ms ease, visibility 0s linear 230ms;
        }
        .defensie-modal-overlay.open { opacity: 1; visibility: visible; pointer-events: auto; transition-delay: 0s; }
        .defensie-modal-content { position: relative; max-width: 90vw; max-height: 90vh; }
        .defensie-modal-image { display: block; max-width: 100%; max-height: 90vh; border-radius: 6px; border: 1px solid #3A4130; box-shadow: 0 24px 80px rgba(0,0,0,.6); }
        .defensie-modal-close {
            position: fixed; top: 96px; right: 24px;
            width: 44px; height: 44px; border-radius: 4px;
            background: #1E2417; border: 1px solid #3A4130; color: #B9BFAE;
            font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: background-color 150ms, border-color 150ms, color 150ms;
            z-index: 1000;
        }
        .defensie-modal-close:hover { background: #F0AE4A; color: #0C0E09; border-color: #F0AE4A; }
        .defensie-modal-close { outline: none; }
        .defensie-modal-close:focus { outline: none; box-shadow: none; }
        .defensie-modal-close:focus-visible { outline: none; box-shadow: none; }
        body.defensie-modal-active { overflow: hidden; }
        @media (prefers-reduced-motion: reduce) { .defensie-modal-overlay { transition: none; } }
    `;
    if (!document.getElementById('defensie-modal-style')) document.head.appendChild(style);

    return { open, close };
})();

window.DefensieModal = DefensieModal;

const DefensieFormModal = (() => {
    let overlay = null;
    let titleEl = null;
    let bodyEl = null;
    let lastFocus = null;

    function ensure() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'defensieFormModal';
        overlay.className = 'defensie-form-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="defensie-form-content" role="dialog" aria-modal="true" aria-label="Formulier">
                <div class="defensie-form-header">
                    <h2 class="defensie-form-title"></h2>
                    <button class="defensie-form-close" type="button" aria-label="Sluiten"><i class="fas fa-times"></i></button>
                </div>
                <div class="defensie-form-body"></div>
            </div>`;
        document.body.appendChild(overlay);
        titleEl = overlay.querySelector('.defensie-form-title');
        bodyEl = overlay.querySelector('.defensie-form-body');
        overlay.querySelector('.defensie-form-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
        document.addEventListener('click', (e) => {
            const openSelect = overlay.querySelector('.custom-select.open');
            if (openSelect && !openSelect.contains(e.target)) openSelect.classList.remove('open');
        });
        return overlay;
    }

    function open(title, bodyHtml) {
        ensure();
        lastFocus = document.activeElement;
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;
        bindSelects();
        bindUploads();
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('defensie-form-active');
        if (!overlay.classList.contains('open')) {
            void overlay.offsetWidth;
            overlay.classList.add('open');
        }
        const first = bodyEl.querySelector('input, textarea, button');
        if (first) requestAnimationFrame(() => { try { first.focus({ preventScroll: true }); } catch (e) {} });
    }

    function bindSelects() {
        bodyEl.querySelectorAll('.custom-select').forEach(wrap => {
            const trigger = wrap.querySelector('.custom-select-trigger');
            const menu = wrap.querySelector('.custom-select-menu');
            const hidden = wrap.querySelector('input[type="hidden"]');
            if (!trigger || !menu || !hidden) return;
            if (trigger.dataset.bound) return;
            trigger.dataset.bound = '1';
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                bodyEl.querySelectorAll('.custom-select.open').forEach(o => { if (o !== wrap) o.classList.remove('open'); });
                wrap.classList.toggle('open');
                trigger.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
            });
            menu.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    hidden.value = opt.dataset.value;
                    trigger.querySelector('span').textContent = opt.textContent.trim();
                    wrap.classList.remove('open');
                    menu.querySelectorAll('.custom-select-option').forEach(o => o.classList.toggle('active', o === opt));
                });
            });
        });
    }

    function setFile(drop, input, file) {
        if (!file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        const preview = drop.querySelector('.upload-preview');
        const nameEl = drop.querySelector('.upload-name');
        const icon = drop.querySelector('.upload-empty-icon');
        if (preview) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            preview.onclick = () => { if (window.DefensieModal) window.DefensieModal.open(preview.src, 'Voorbeeld'); };
            preview.style.cursor = 'zoom-in';
        }
        if (icon) icon.style.display = 'none';
        if (nameEl) nameEl.textContent = file.name;
    }
    function bindUploads() {
        bodyEl.querySelectorAll('.upload-drop').forEach(drop => {
            const input = drop.querySelector('input[type="file"]');
            if (!input || input.dataset.bound) return;
            input.dataset.bound = '1';
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (file) setFile(drop, input, file);
            });
            ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('dragover'); }));
            ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('dragover'); }));
            drop.addEventListener('drop', (e) => {
                const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (file) setFile(drop, input, file);
            });
            const previewBtn = drop.querySelector('[data-preview]');
            if (previewBtn) {
                previewBtn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const src = (bodyEl.querySelector('#f_image') || {}).value || drop.querySelector('.upload-preview')?.src;
                    if (src && window.DefensieModal) window.DefensieModal.open(src, 'Voorbeeld');
                });
            }
            const clearBtn = drop.querySelector('[data-clear]');
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    input.value = '';
                    const hidden = bodyEl.querySelector('#f_image');
                    if (hidden) hidden.value = '';
                    const preview = drop.querySelector('.upload-preview');
                    if (preview) { preview.src = ''; preview.style.display = 'none'; }
                    const icon = drop.querySelector('.upload-empty-icon');
                    if (icon) icon.style.display = '';
                    const nameEl = drop.querySelector('.upload-name');
                    if (nameEl) nameEl.textContent = 'Geen afbeelding';
                    drop.querySelector('[data-preview]')?.remove();
                    clearBtn.remove();
                });
            }
        });
    }

    function close() {
        if (!overlay || !overlay.classList.contains('open')) return;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('defensie-form-active');
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
        }
    }

    function getBody() { ensure(); return bodyEl; }

    const style = document.createElement('style');
    style.id = 'defensie-form-style';
    style.textContent = `
        .defensie-form-overlay { position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(8,10,7,.88); backdrop-filter:blur(8px); opacity:0; visibility:hidden; pointer-events:none; transition:opacity 230ms ease, visibility 0s linear 230ms; }
        .defensie-form-overlay.open { opacity:1; visibility:visible; pointer-events:auto; transition-delay:0s; }
        .defensie-form-content { background:#1E2417; border:1px solid #3A4130; border-radius:8px; max-width:860px; width:100%; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 80px rgba(0,0,0,.6); }
        .defensie-form-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 22px; border-bottom:1px solid #3A4130; background:#14170F; }
        .defensie-form-title { color:#EDEFE6; font:700 22px 'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.02em; margin:0; }
        .defensie-form-close { width:40px; height:40px; border-radius:4px; background:#1E2417; border:1px solid #3A4130; color:#B9BFAE; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background-color 150ms, color 150ms, border-color 150ms; }
        .defensie-form-close:hover { background:#F0AE4A; color:#0C0E09; border-color:#F0AE4A; }
        .defensie-form-body { padding:22px; overflow-y:auto; flex:1; scrollbar-width:thin; scrollbar-color:#3A4130 transparent; }
        .defensie-form-body::-webkit-scrollbar { width:8px; }
        .defensie-form-body::-webkit-scrollbar-track { background:transparent; }
        .defensie-form-body::-webkit-scrollbar-thumb { background:#3A4130; border-radius:4px; }
        .defensie-form-body::-webkit-scrollbar-thumb:hover { background:#F0AE4A; }
        .defensie-form-body .custom-select-menu { max-height:220px; overflow-y:auto; }
        /* inputs, dropdown, upload en buttons via style.css */
        body.defensie-form-active { overflow:hidden; }
        @media(max-width:640px) { .defensie-form-body .form-grid { grid-template-columns:1fr; } }
    `;
    if (!document.getElementById('defensie-form-style')) document.head.appendChild(style);

    return { open, close, getBody };
})();

window.DefensieFormModal = DefensieFormModal;
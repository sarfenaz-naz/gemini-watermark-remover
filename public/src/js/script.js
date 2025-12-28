/**
 * Gemini Watermark Remover - Batch Processing
 */

const STATE = {
    masks: {
        small: null,
        large: null
    },
    processors: [],
    customLogo: {
        image: null,
        opacity: 0.8,
        scale: 1.0
    }
};

// Global DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const resultsContainer = document.getElementById('resultsContainer');
const globalActions = document.getElementById('globalActions');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const themeToggle = document.getElementById('themeToggle');

// Logo Elements
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const logoUploadArea = document.getElementById('logoUploadArea');
const logoOpacity = document.getElementById('logoOpacity');
const logoScale = document.getElementById('logoScale');
const logoControls = document.getElementById('logoControls');
const clearLogoBtn = document.getElementById('clearLogoBtn');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Initialization
async function init() {
    initTheme();
    try {
        await Promise.all([
            loadMask('assets/mask_48.png', 'small'),
            loadMask('assets/mask_96.png', 'large')
        ]);
        console.log('Masks loaded');
    } catch (e) {
        console.error('Failed to load masks', e);
    }
}

function loadMask(url, type) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const w = img.width;
            const h = img.height;
            const cvs = document.createElement('canvas');
            cvs.width = w; cvs.height = h;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, w, h).data;
            const alphas = new Float32Array(w * h);
            for (let i = 0; i < w * h; i++) {
                alphas[i] = Math.max(data[i*4], data[i*4+1], data[i*4+2]) / 255.0;
            }
            STATE.masks[type] = { width: w, height: h, alphas };
            resolve();
        };
        img.onerror = reject;
    });
}

// Image Processor Class
class ImageProcessor {
    constructor(file) {
        this.file = file;
        this.config = { forceMode: 'auto', alphaGain: 1.0 };
        this.state = { originalImage: null, processedImageData: null };
        this.createUI();
        this.loadImage();
    }

    createUI() {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <div class="image-wrapper">
                <canvas></canvas>
                <div class="loading-overlay" style="position:absolute; inset:0; display:none; justify-content:center; align-items:center; background:rgba(0,0,0,0.5);">
                    <div style="width:24px; height:24px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>
                </div>
            </div>
            <div class="card-controls">
                <select>
                    <option value="auto">Auto Size</option>
                    <option value="small">Force Small</option>
                    <option value="large">Force Large</option>
                </select>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary);">
                    <span>Intensity</span>
                    <span class="alpha-value">1.0</span>
                </div>
                <input type="range" min="1.0" max="3.0" step="0.1" value="1.0">
                <div class="actions">
                    <button class="btn btn-secondary remove-btn" style="padding:0.5rem;">✕</button>
                    <button class="btn btn-primary download-btn" disabled style="flex:1;">Download</button>
                </div>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;

        this.elements = {
            card: card,
            canvas: card.querySelector('canvas'),
            ctx: card.querySelector('canvas').getContext('2d', { willReadFrequently: true }),
            loading: card.querySelector('.loading-overlay'),
            sizeSelect: card.querySelector('select'),
            alphaInput: card.querySelector('input[type="range"]'),
            alphaValue: card.querySelector('.alpha-value'),
            downloadBtn: card.querySelector('.download-btn'),
            removeBtn: card.querySelector('.remove-btn'),
            wrapper: card.querySelector('.image-wrapper')
        };

        this.elements.sizeSelect.onchange = (e) => { this.config.forceMode = e.target.value; this.process(); };
        this.elements.alphaInput.oninput = (e) => { 
            this.config.alphaGain = parseFloat(e.target.value);
            this.elements.alphaValue.textContent = this.config.alphaGain.toFixed(1);
            this.process();
        };
        this.elements.downloadBtn.onclick = () => this.download();
        this.elements.removeBtn.onclick = () => this.destroy();

        // Comparison Logic
        const showOriginal = () => { if(this.state.originalImage) this.elements.ctx.drawImage(this.state.originalImage, 0, 0); };
        const showProcessed = () => { if(this.state.processedImageData) this.elements.ctx.putImageData(this.state.processedImageData, 0, 0); };
        
        // Touch/Mouse events for comparison
        ['mousedown', 'touchstart'].forEach(evt => 
            this.elements.wrapper.addEventListener(evt, (e) => {
                if(e.type==='mousedown' && e.button!==0) return;
                showOriginal();
            }, {passive:true})
        );
        ['mouseup', 'mouseleave', 'touchend'].forEach(evt => 
            this.elements.wrapper.addEventListener(evt, showProcessed)
        );

        // Click to open lightbox
        this.elements.wrapper.onclick = (e) => {
            // Check if it was a quick tap (not a long press for comparison)
            if(Lightbox && this.state.originalImage) Lightbox.open(this.state.processedImageData, this.state.originalImage);
        };

        resultsContainer.appendChild(card);
    }

    loadImage() {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.originalImage = img;
                this.process();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(this.file);
    }

    process() {
        if (!this.state.originalImage) return;
        this.elements.loading.style.display = 'flex';
        
        requestAnimationFrame(() => {
            const img = this.state.originalImage;
            const cvs = this.elements.canvas;
            cvs.width = img.width; cvs.height = img.height;
            
            // Draw original
            this.elements.ctx.drawImage(img, 0, 0);
            const imageData = this.elements.ctx.getImageData(0, 0, cvs.width, cvs.height);

            // Remove Watermark
            this.removeWatermark(imageData);

            // Put modified data
            this.elements.ctx.putImageData(imageData, 0, 0);

            // Apply Logo
            this.applyLogo();

            // Save state
            this.state.processedImageData = this.elements.ctx.getImageData(0, 0, cvs.width, cvs.height);
            this.elements.loading.style.display = 'none';
            this.elements.downloadBtn.disabled = false;
        });
    }

    removeWatermark(imageData) {
        const w = imageData.width;
        const h = imageData.height;
        let mode = this.config.forceMode;
        if (mode === 'auto') mode = (w > 1024 && h > 1024) ? 'large' : 'small';
        
        const mask = STATE.masks[mode];
        if (!mask) return;

        const margin = mode === 'large' ? 64 : 32;
        const posX = w - margin - mask.width;
        const posY = h - margin - mask.height;
        if (posX < 0 || posY < 0) return;

        const data = imageData.data;
        const gain = this.config.alphaGain;

        for (let my = 0; my < mask.height; my++) {
            for (let mx = 0; mx < mask.width; mx++) {
                const idx = ((posY + my) * w + (posX + mx)) * 4;
                if (idx >= data.length) continue;

                let alpha = mask.alphas[my * mask.width + mx] * gain;
                if (alpha < 0.002) continue;
                if (alpha > 0.99) alpha = 0.99;

                for (let c = 0; c < 3; c++) {
                    let val = (data[idx + c] - alpha * 255) / (1 - alpha);
                    data[idx + c] = Math.min(255, Math.max(0, val));
                }
            }
        }
    }

    applyLogo() {
        if (!STATE.customLogo.image) return;
        const ctx = this.elements.ctx;
        const cvs = this.elements.canvas;
        const logo = STATE.customLogo.image;
        
        // Logic to size logo similar to watermark
        let mode = this.config.forceMode === 'auto' 
            ? ((cvs.width > 1024 && cvs.height > 1024) ? 'large' : 'small') 
            : this.config.forceMode;
        
        const targetSize = mode === 'large' ? 96 : 48;
        const margin = mode === 'large' ? 64 : 32;
        const scale = Math.min(targetSize/logo.width, targetSize/logo.height) * STATE.customLogo.scale;
        
        const lw = logo.width * scale;
        const lh = logo.height * scale;
        
        ctx.save();
        ctx.globalAlpha = STATE.customLogo.opacity;
        ctx.drawImage(logo, cvs.width - margin - lw, cvs.height - margin - lh, lw, lh);
        ctx.restore();
    }

    download() {
        if (!this.state.processedImageData) return;
        this.elements.canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = this.file.name.replace(/\.[^/.]+$/, "") + "_clean.png";
            a.href = url;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }

    destroy() {
        this.elements.card.remove();
        STATE.processors = STATE.processors.filter(p => p !== this);
        updateUIState();
    }
}

// Global Handlers
function handleFiles(files) {
    if (!files.length) return;
    Array.from(files).forEach(f => {
        if (f.type.startsWith('image/')) STATE.processors.push(new ImageProcessor(f));
    });
    fileInput.value = '';
    updateUIState();
}

function updateUIState() {
    const hasFiles = STATE.processors.length > 0;
    document.body.classList.toggle('has-files', hasFiles);
    globalActions.style.display = hasFiles ? 'flex' : 'none';
}

// Drop Zone Events
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent-primary)'; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--card-border)'; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--card-border)';
    handleFiles(e.dataTransfer.files);
});
dropZone.addEventListener('click', (e) => {
    if (e.target.closest('.image-card')) return;
    fileInput.click();
});
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

downloadAllBtn.onclick = () => {
    STATE.processors.forEach((p, i) => setTimeout(() => p.download(), i * 300));
};

// Logo Logic
logoUploadArea.onclick = () => logoInput.click();
logoInput.onchange = (e) => {
    const f = e.target.files[0];
    if (f) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                STATE.customLogo.image = img;
                logoPreview.innerHTML = `<img src="${ev.target.result}">`;
                logoControls.style.display = 'flex';
                clearLogoBtn.style.display = 'block';
                STATE.processors.forEach(p => p.process());
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(f);
    }
    logoInput.value = '';
};

const updateLogoConfig = () => {
    STATE.customLogo.opacity = parseInt(logoOpacity.value) / 100;
    STATE.customLogo.scale = parseInt(logoScale.value) / 100;
    document.getElementById('logoOpacityValue').textContent = logoOpacity.value + '%';
    document.getElementById('logoScaleValue').textContent = logoScale.value + '%';
    STATE.processors.forEach(p => p.process());
};

logoOpacity.oninput = updateLogoConfig;
logoScale.oninput = updateLogoConfig;

clearLogoBtn.onclick = () => {
    STATE.customLogo.image = null;
    logoPreview.innerHTML = '<span class="upload-icon">+</span><span class="upload-text">Upload</span>';
    logoControls.style.display = 'none';
    clearLogoBtn.style.display = 'none';
    STATE.processors.forEach(p => p.process());
};

// Lightbox
const Lightbox = {
    modal: document.getElementById('lightbox'),
    img: document.getElementById('lightboxImage'),
    closeBtn: document.querySelector('.lightbox-close'),
    init() {
        this.closeBtn.onclick = () => this.close();
        this.modal.onclick = (e) => { if(e.target===this.modal) this.close(); };
    },
    open(data, original) {
        // Toggle logic inside lightbox
        this.modal.style.display = 'flex';
        const showProcessed = () => {
            const c = document.createElement('canvas');
            c.width = data.width; c.height = data.height;
            c.getContext('2d').putImageData(data,0,0);
            this.img.src = c.toDataURL();
        };
        showProcessed();
        
        // Tap to toggle
        this.img.onmousedown = () => { this.img.src = original.src; };
        this.img.onmouseup = showProcessed;
        this.img.ontouchstart = () => { this.img.src = original.src; };
        this.img.ontouchend = showProcessed;
    },
    close() { this.modal.style.display = 'none'; }
};
Lightbox.init();
init();

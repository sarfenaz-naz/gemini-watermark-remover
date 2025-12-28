<!DOCTYPE html>
<html lang="en" data-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Gemini Watermark Remover</title>
    <meta name="title" content="Gemini Watermark Remover">
    <meta name="description" content="Remove visible watermarks from Gemini-generated images instantly and for free. Local processing ensures your privacy. No quality loss. Support for Batch Processing.">
    <meta name="keywords" content="gemini watermark remover, google gemini image cleaner, remove watermark ai, free watermark remover, client-side image processing, privacy focused tool">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="author" content="Sarfenaz">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://github.com/sarfenaz-naz/gemini-watermark-remover/">
    <meta property="og:title" content="Gemini Watermark Remover - Free AI Image Cleaner">
    <meta property="og:description" content="Remove visible watermarks from Gemini-generated images instantly. Free, private, and runs locally in your browser.">
    <meta property="og:image" content="seobanner.png">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://github.com/sarfenaz-naz/gemini-watermark-remover/">
    <meta property="twitter:title" content="Gemini Watermark Remover - Free AI Image Cleaner">
    <meta property="twitter:description" content="Remove visible watermarks from Gemini-generated images instantly. Free, private, and runs locally in your browser.">
    <meta property="twitter:image" content="seobanner.png">

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">

    <link rel="stylesheet" href="/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>

<body>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <div class="container">
        <header>
            <div class="header-top">
                <div class="logo-text">Gemini Cleaner</div>
                <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">
                    <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
            </div>
            
            <div class="hero-section">
                <h1>Remove Watermarks<br><span class="gradient-text">Instantly & Free</span></h1>
                <p class="subtitle">Clean your Gemini-generated images with professional reverse Alpha blending technology. No quality loss.</p>
            </div>
        </header>

        <div class="app-card">
            <div id="globalActions" class="global-actions" style="display: none;">
                <button id="downloadAllBtn" class="btn btn-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download All
                </button>
            </div>

            <div id="logoSettings" class="logo-settings">
                <div class="logo-header">
                    <span class="logo-title">🎨 Add Custom Logo (Optional)</span>
                    <button id="clearLogoBtn" class="btn btn-tiny btn-ghost" style="display: none;">Clear</button>
                </div>

                <div class="logo-content">
                    <div id="logoUploadArea" class="logo-upload-area">
                        <div id="logoPreview" class="logo-preview">
                            <span class="upload-icon">+</span>
                            <span class="upload-text">Upload</span>
                        </div>
                        <input type="file" id="logoInput" class="hidden" accept="image/*">
                    </div>

                    <div id="logoControls" class="logo-controls" style="display: none;">
                        <div class="control-row">
                            <label>Opacity: <span id="logoOpacityValue">80%</span></label>
                            <input type="range" id="logoOpacity" min="0" max="100" value="80">
                        </div>
                        <div class="control-row">
                            <label>Size: <span id="logoScaleValue">100%</span></label>
                            <input type="range" id="logoScale" min="10" max="200" value="100">
                        </div>
                    </div>
                </div>
            </div>

            <div id="dropZone" class="drop-zone">
                <div id="resultsContainer" class="results-container"></div>

                <div class="upload-prompt">
                    <div class="upload-icon-wrapper">
                        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                    </div>
                    <div class="upload-text-group">
                        <h3>Drop images here</h3>
                        <p>or click to browse (JPG, PNG, WEBP)</p>
                    </div>
                </div>

                <input type="file" id="fileInput" class="hidden" accept="image/*" multiple>
            </div>
        </div>

        <div id="infoSections" class="info-sections">
            
            <section class="how-it-works">
                <h2>How It Works</h2>
                <div class="steps-grid">
                    <div class="step-card">
                        <div class="step-icon">1</div>
                        <h3>Upload</h3>
                        <p>Drag and drop your watermarked images into the box above.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">2</div>
                        <h3>Process</h3>
                        <p>Our algorithm automatically detects and removes the watermark.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">3</div>
                        <h3>Download</h3>
                        <p>Save your clean, high-quality images instantly.</p>
                    </div>
                </div>
            </section>

            <section class="faq-section">
                <h2>User Guide & FAQ</h2>
                <div class="faq-grid">
                    <details class="faq-item">
                        <summary>How do I use this tool?</summary>
                        <p>Simply click the upload box or drag images into it. The watermark is removed automatically. You can adjust the "Intensity" slider if some watermark remains.</p>
                    </details>
                    <details class="faq-item">
                        <summary>Is my data private?</summary>
                        <p>Yes! All processing happens locally in your browser. Your images are never uploaded to any server.</p>
                    </details>
                    <details class="faq-item">
                        <summary>Can I add my own logo?</summary>
                        <p>Yes. Use the "Add Custom Logo" section to upload your own branding. It will be placed in the corner automatically.</p>
                    </details>
                </div>
            </section>
        </div>
    </div>

    <footer>
        <p>Runs locally in your browser. Privacy focused.</p>
    </footer>

    <div id="lightbox" class="lightbox">
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" id="lightboxImage">
        <div class="lightbox-caption">Original vs Processed (Tap/Click to swap)</div>
    </div>

    <script src="src/js/script.js"></script>
</body>

</html>

import base64
import os

with open(r'c:\Users\prajw\Desktop\RedFlow\frontend\src\assets\logo.png', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('utf-8')

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RedFlow Presentation Slide Background Designer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B132B;
      color: #E2E8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .header h1 span.red { color: #EF4444; }
    .header p {
      color: #94A3B8;
      font-size: 15px;
      margin-top: 6px;
    }
    .controls {
      background: #172B4D;
      border: 1px solid #2D3748;
      padding: 16px 24px;
      border-radius: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .control-group label {
      font-size: 14px;
      font-weight: 600;
      color: #CBD5E1;
    }
    select, input[type="text"], input[type="range"] {
      background: #0B132B;
      border: 1px solid #334155;
      color: #FFFFFF;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }
    select:focus, input[type="text"]:focus {
      border-color: #EF4444;
    }
    .btn {
      background: #D32F2F;
      color: #FFFFFF;
      border: none;
      padding: 9px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #B71C1C;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #334155;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .slide-wrapper {
      width: 100%;
      max-width: 1100px;
      position: relative;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
    }
    canvas {
      width: 100%;
      height: auto;
      display: block;
    }
    .sample-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 6% 6% 6% 6%;
      transition: opacity 0.3s;
    }
    .sample-content-box {
      max-width: 75%;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .light-theme-text .badge { background: #FEE2E2; color: #DC2626; }
    .dark-theme-text .badge { background: rgba(220, 38, 38, 0.25); color: #F87171; }
    
    .sample-title {
      font-size: clamp(20px, 3.2vw, 42px);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 12px;
    }
    .light-theme-text .sample-title { color: #0F172A; }
    .dark-theme-text .sample-title { color: #FFFFFF; }
    
    .sample-desc {
      font-size: clamp(12px, 1.4vw, 18px);
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .light-theme-text .sample-desc { color: #475569; }
    .dark-theme-text .sample-desc { color: #94A3B8; }

    .sample-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .sample-card {
      padding: 16px;
      border-radius: 8px;
    }
    .light-theme-text .sample-card {
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      color: #0F172A;
    }
    .dark-theme-text .sample-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid #334155;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      color: #FFFFFF;
    }
    .card-val { font-size: 24px; font-weight: 800; color: #EF4444; }
    .card-lbl { font-size: 12px; color: #64748B; margin-top: 4px; font-weight: 600; }

    .hidden { display: none !important; }

    .instructions {
      max-width: 1100px;
      width: 100%;
      margin-top: 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    .inst-card {
      background: #172B4D;
      border: 1px solid #2D3748;
      border-radius: 10px;
      padding: 20px;
    }
    .inst-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .inst-card p, .inst-card ol {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.6;
      margin-left: 18px;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>
      <img src="data:image/png;base64,''' + logo_b64 + '''' style="height:36px; width:36px;" alt="Logo">
      <span><span class="red">Red</span>Flow Slide Background Designer</span>
    </h1>
    <p>Official 16:9 Presentation Backgrounds (1920 × 1080 HD)</p>
  </div>

  <div class="controls">
    <div class="control-group">
      <label>Theme:</label>
      <select id="themeSelect" onchange="renderSlide()">
        <option value="light">Executive Light (Clean Modern)</option>
        <option value="light_prominent">Light (Prominent Watermark)</option>
        <option value="dark">Deep Tech Dark (Navy & Ruby)</option>
      </select>
    </div>

    <div class="control-group">
      <label>Watermark Opacity:</label>
      <input type="range" id="opacitySlider" min="3" max="25" value="9" oninput="renderSlide()">
      <span id="opacityVal" style="font-size: 13px; width: 32px;">9%</span>
    </div>

    <div class="control-group">
      <label>Page Number:</label>
      <input type="text" id="pageInput" value="01" style="width: 65px; text-align: center;" oninput="renderSlide()">
    </div>

    <button class="btn" onclick="downloadCurrentSlide()">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      Download 1080p PNG
    </button>

    <button class="btn btn-secondary" id="toggleSampleBtn" onclick="toggleSample()">
      Toggle Sample Text
    </button>
  </div>

  <div class="slide-wrapper">
    <canvas id="slideCanvas" width="1920" height="1080"></canvas>

    <!-- Interactive Mockup Overlay to test legibility -->
    <div id="sampleOverlay" class="sample-overlay light-theme-text">
      <div class="sample-content-box">
        <span class="badge">Architecture Overview</span>
        <h2 class="sample-title">Decentralized Blood Supply & Traceability Ecosystem</h2>
        <p class="sample-desc">
          Verifying donor eligibility on-chain while tracking cold-chain blood units from phlebotomy donation to recipient transfusion via dynamic cryptographic proof.
        </p>

        <div class="sample-cards">
          <div class="sample-card">
            <div class="card-val">100%</div>
            <div class="card-lbl">Tamper-Evident Units</div>
          </div>
          <div class="sample-card">
            <div class="card-val">4 Roles</div>
            <div class="card-lbl">Admin, Donor, Hospital, Lab</div>
          </div>
          <div class="sample-card">
            <div class="card-val">&lt; 2.5s</div>
            <div class="card-lbl">QR Verification Speed</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="instructions">
    <div class="inst-card">
      <h3>📊 PowerPoint Usage</h3>
      <ol>
        <li>Open PowerPoint, click <strong>Design &gt; Format Background</strong>.</li>
        <li>Select <strong>Picture or texture fill &gt; Insert</strong> and choose the PNG.</li>
        <li>Click <strong>Apply to All</strong> (or paste into <em>View &gt; Slide Master</em>).</li>
      </ol>
    </div>
    <div class="inst-card">
      <h3>☁️ Google Slides Usage</h3>
      <ol>
        <li>Open your deck in Google Slides.</li>
        <li>Click <strong>Slide &gt; Change background</strong>.</li>
        <li>Click <strong>Choose image</strong> and upload the downloaded PNG.</li>
        <li>Click <strong>Add to theme</strong> to apply to all slides.</li>
      </ol>
    </div>
    <div class="inst-card">
      <h3>🎨 Custom Numbering</h3>
      <p style="margin-left: 0;">
        Use the Page Number input above to generate slides with any number (e.g. <code>01</code>, <code>02</code>, <code>15</code>) or leave it blank to use your presentation app's dynamic page number field.
      </p>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('slideCanvas');
    const ctx = canvas.getContext('2d');
    const themeSelect = document.getElementById('themeSelect');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityVal = document.getElementById('opacityVal');
    const pageInput = document.getElementById('pageInput');
    const sampleOverlay = document.getElementById('sampleOverlay');

    const logoImg = new Image();
    logoImg.src = 'data:image/png;base64,''' + logo_b64 + ''';
    logoImg.onload = () => {
      renderSlide();
    };

    opacitySlider.addEventListener('input', () => {
      opacityVal.textContent = opacitySlider.value + '%';
    });

    function renderSlide() {
      const theme = themeSelect.value;
      const opacity = parseInt(opacitySlider.value, 10) / 100;
      const pageStr = pageInput.value.trim();
      const isDark = theme === 'dark';

      // Update sample overlay text color class
      sampleOverlay.className = isDark ? 'sample-overlay dark-theme-text' : 'sample-overlay light-theme-text';

      // 1. Background Fill
      if (!isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080);
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(1, '#F8FAFC');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Top Accent Bar (RedFlow Crimson to Deep Navy)
        const topGrad = ctx.createLinearGradient(0, 0, 1920, 0);
        topGrad.addColorStop(0, '#D32F2F');
        topGrad.addColorStop(0.5, '#E53935');
        topGrad.addColorStop(1, '#172B4D');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, 1920, 5);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080);
        bgGrad.addColorStop(0, '#0B132B');
        bgGrad.addColorStop(1, '#131F37');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Subtle ambient radial glow
        const radGlow = ctx.createRadialGradient(960, 540, 50, 960, 540, 550);
        radGlow.addColorStop(0, 'rgba(211, 47, 47, 0.08)');
        radGlow.addColorStop(1, 'rgba(11, 19, 43, 0)');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, 1920, 1080);

        // Top Accent Bar (Crimson)
        const topGrad = ctx.createLinearGradient(0, 0, 1920, 0);
        topGrad.addColorStop(0, '#EF4444');
        topGrad.addColorStop(1, '#DC2626');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, 1920, 4);
      }

      // 2. Large Watermark Logo in Center
      const wmSize = 670;
      const wmX = (1920 - wmSize) / 2;
      const wmY = (1080 - wmSize) / 2 + 10;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImg, wmX, wmY, wmSize, wmSize);
      ctx.restore();

      // 3. Top-Right Branding: Logo + 'Red' + 'Flow'
      const brandLogoSize = 36;
      ctx.font = 'bold 34px "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif';
      const redW = ctx.measureText('Red').width;
      const flowW = ctx.measureText('Flow').width;
      const gap = 12;
      const marginR = 72;
      const topY = 44;
      const totalBrandW = brandLogoSize + gap + redW + flowW;
      const startX = 1920 - marginR - totalBrandW;

      ctx.drawImage(logoImg, startX, topY, brandLogoSize, brandLogoSize);

      ctx.fillStyle = isDark ? '#EF4444' : '#D32F2F';
      ctx.fillText('Red', startX + brandLogoSize + gap, topY + 29);

      ctx.fillStyle = isDark ? '#FFFFFF' : '#172B4D';
      ctx.fillText('Flow', startX + brandLogoSize + gap + redW, topY + 29);

      // 4. Footer Line
      const footerY = 1080 - 64;
      ctx.strokeStyle = isDark ? '#1E293B' : '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(72, footerY);
      ctx.lineTo(1920 - 72, footerY);
      ctx.stroke();

      // Footer Left text
      ctx.font = '500 14px "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
      ctx.fillText('RedFlow  •  Decentralized Blood Supply & Traceability Platform', 72, footerY + 22);

      // 5. Bottom Right: Page Number
      if (pageStr) {
        ctx.font = 'bold 22px "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif';
        const numW = ctx.measureText(pageStr).width;
        const btnW = Math.max(52, numW + 28);
        const btnH = 32;
        const bx1 = 1920 - 72 - btnW;
        const by1 = footerY + 9;

        // Draw pill
        ctx.fillStyle = isDark ? '#18212F' : '#F1F5F9';
        ctx.strokeStyle = isDark ? '#334155' : '#E2E8F0';
        ctx.lineWidth = 1;
        roundRect(ctx, bx1, by1, btnW, btnH, 6, true, true);

        // Draw number text
        ctx.fillStyle = isDark ? '#F87171' : '#D32F2F';
        ctx.textAlign = 'center';
        ctx.fillText(pageStr, bx1 + btnW / 2, by1 + 23);
        ctx.textAlign = 'left';
      }
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function toggleSample() {
      sampleOverlay.classList.toggle('hidden');
    }

    function downloadCurrentSlide() {
      const link = document.createElement('a');
      const pageStr = pageInput.value.trim() || 'master';
      const theme = themeSelect.value;
      link.download = `redflow_slide_bg_${theme}_p${pageStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  </script>
</body>
</html>
'''

with open(r'c:\Users\prajw\Desktop\RedFlow\docs\slides\index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

artifact_dir = r'C:\Users\prajw\.gemini\antigravity\brain\640542b5-c6cd-44d9-adaf-6a1e585a7de3'
with open(os.path.join(artifact_dir, 'slide_designer.html'), 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Generated index.html and slide_designer.html')

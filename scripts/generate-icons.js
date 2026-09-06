import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard SVG Icon (512x512)
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="sphereGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Background Subtle Rings -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="8 8" />

  <!-- Center Symbol Container with Shadow -->
  <g filter="url(#shadow)">
    <!-- Central Sphere Orbit Ring -->
    <ellipse cx="256" cy="235" rx="140" ry="46" fill="none" stroke="url(#sphereGrad)" stroke-width="16" transform="rotate(-20 256 235)" stroke-linecap="round" />

    <!-- Open Book Base -->
    <path d="M256 295 L140 235 C140 235 155 350 256 375 C357 350 372 235 372 235 Z" fill="url(#bookGrad)" />
    
    <!-- Spine Divider -->
    <path d="M256 295 L256 375" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />

    <!-- Central Glowing Core Sphere -->
    <circle cx="256" cy="220" r="48" fill="url(#sphereGrad)" />
    <circle cx="240" cy="205" r="14" fill="#ffffff" fill-opacity="0.6" />

    <!-- Academic Cap Accent -->
    <path d="M256 128 L348 168 L256 208 L164 168 Z" fill="#ffffff" />
    <path d="M348 168 L348 215" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />
    <circle cx="348" cy="220" r="5" fill="#f59e0b" />
  </g>
</svg>
`;

// 2. Maskable SVG Icon (Safe zone centered with extra margin)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="sphereGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="bookGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for Android masking -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Scaled content within 75% safe area -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Central Sphere Orbit Ring -->
    <ellipse cx="256" cy="235" rx="140" ry="46" fill="none" stroke="url(#sphereGradMask)" stroke-width="18" transform="rotate(-20 256 235)" stroke-linecap="round" />

    <!-- Open Book Base -->
    <path d="M256 295 L140 235 C140 235 155 350 256 375 C357 350 372 235 372 235 Z" fill="url(#bookGradMask)" />
    <path d="M256 295 L256 375" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />

    <!-- Central Glowing Core Sphere -->
    <circle cx="256" cy="220" r="48" fill="url(#sphereGradMask)" />
    <circle cx="240" cy="205" r="14" fill="#ffffff" fill-opacity="0.6" />

    <!-- Academic Cap Accent -->
    <path d="M256 128 L348 168 L256 208 L164 168 Z" fill="#ffffff" />
    <path d="M348 168 L348 215" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />
    <circle cx="348" cy="220" r="5" fill="#f59e0b" />
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg.trim());

  const stdBuffer = Buffer.from(standardSvg);
  const maskBuffer = Buffer.from(maskableSvg);

  // 192x192
  await sharp(stdBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(stdBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Maskable 512x512
  await sharp(maskBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple Touch Icon 180x180
  await sharp(stdBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 48x48 / 64x64
  await sharp(stdBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all PWA icons!');
}

generate().catch(console.error);

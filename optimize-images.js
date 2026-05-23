import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'src/assets/images');

async function optimizeHero() {
  const srcPath = path.join(IMAGES_DIR, 'plumbing_work_hero_1779484799974.png');
  const destPath = path.join(IMAGES_DIR, 'plumbing_work_hero_1779484799974.webp');

  if (fs.existsSync(srcPath)) {
    console.log(`Starting optimization of hero image: ${srcPath}`);
    await sharp(srcPath)
      .resize({ width: 1400, withoutEnlargement: true }) // Perfect for responsive screens
      .webp({ quality: 80, effort: 6 })
      .toFile(destPath);
    console.log(`Successfully optimized and created WebP hero at ${destPath}`);
  } else {
    console.log(`Hero image not found at ${srcPath}`);
  }
}

async function createServiceThumbnails() {
  // Brand colors & gradients for beautiful custom technical layouts
  const services = [
    { id: 'drain-cleaning', label: 'DRAIN CLEANING', bgStart: '#091522', bgEnd: '#E8581C' },
    { id: 'water-heaters', label: 'WATER HEATERS', bgStart: '#091522', bgEnd: '#F59E0B' },
    { id: 'leak-detection', label: 'LEAK DETECTION', bgStart: '#091522', bgEnd: '#10B981' },
    { id: 'well-water-systems', label: 'WELL WATER SYSTEMS', bgStart: '#091522', bgEnd: '#06B6D4' },
    { id: 'toilets-faucets', label: 'FIXTURE SERVICES', bgStart: '#091522', bgEnd: '#6366F1' },
    { id: 'pipe-replacement', label: 'PIPE REPLACEMENT', bgStart: '#091522', bgEnd: '#EC4899' },
  ];

  for (const srv of services) {
    const destPath = path.join(IMAGES_DIR, `service-${srv.id}.webp`);
    console.log(`Creating high-fidelity vector-like service thumbnail for: ${srv.id}`);
    
    // Create an elegant gradient SVG background
    const svgString = `
      <svg width="400" height="225" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g_${srv.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${srv.bgStart}" />
            <stop offset="100%" stop-color="${srv.bgEnd}" stop-opacity="0.3" />
          </linearGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          </pattern>
        </defs>
        <!-- Background -->
        <rect width="100%" height="100%" fill="#0b1c2e" />
        <rect width="100%" height="100%" fill="url(#g_${srv.id})" />
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <!-- Subtle branding graphics -->
        <circle cx="330" cy="112" r="60" fill="none" stroke="${srv.bgEnd}" stroke-width="2" stroke-opacity="0.2" />
        <circle cx="330" cy="112" r="40" fill="none" stroke="${srv.bgEnd}" stroke-width="1" stroke-opacity="0.1" />
        <path d="M 50 112 Q 150 50 250 112 T 350 112" fill="none" stroke="rgba(232, 88, 28, 0.1)" stroke-width="3" />

        <!-- Accent Line -->
        <line x1="30" y1="180" x2="120" y2="180" stroke="${srv.bgEnd}" stroke-width="4" stroke-linecap="round" />

        <!-- Overlay Text labels -->
        <text x="30" y="155" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" letter-spacing="-1">${srv.label}</text>
        <text x="30" y="45" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-weight="700" font-size="9" letter-spacing="3">MCKINNEY PLUMBING</text>
        <text x="345" y="200" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="10">24/7 DISPATCH</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgString);

    await sharp(svgBuffer)
      .webp({ quality: 85 })
      .toFile(destPath);
      
    console.log(`Created WebP thumbnail for ${srv.id} at ${destPath}`);
  }
}

async function run() {
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    await optimizeHero();
    await createServiceThumbnails();
    console.log("All image optimizations completed successfully!");
  } catch (err) {
    console.error("Failed to optimize images:", err);
  }
}

run();

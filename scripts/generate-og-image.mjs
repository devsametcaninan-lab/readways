/**
 * Generates the Open Graph / social share image (1200×630).
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const logoPath = path.join(publicDir, "readways-logo-navbar-transparent.png");
const outputPath = path.join(publicDir, "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;
const BG = "#0a0b10";
const PURPLE = "#7C3AED";
const ACCENT_SOFT = "#9F8CFF";

function backgroundSvg() {
  return Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glowMain" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stop-color="${PURPLE}" stop-opacity="0.28"/>
          <stop offset="45%" stop-color="${ACCENT_SOFT}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glowEdge" cx="78%" cy="18%" r="40%">
          <stop offset="0%" stop-color="${PURPLE}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#12131a" stop-opacity="1"/>
          <stop offset="100%" stop-color="${BG}" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#topFade)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowMain)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowEdge)"/>
      <rect x="0" y="${HEIGHT - 1}" width="${WIDTH}" height="1" fill="#ffffff" fill-opacity="0.06"/>
    </svg>`
  );
}

function textOverlaySvg() {
  return Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .headline {
          font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 54px;
          font-weight: 600;
          fill: #ffffff;
          letter-spacing: -0.02em;
        }
        .subline {
          font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 28px;
          font-weight: 400;
          fill: #94a3b8;
          letter-spacing: 0.01em;
        }
        .brand {
          font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 22px;
          font-weight: 500;
          fill: #c4b5fd;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
      </style>
      <text x="96" y="360" class="headline">PDF Okurken AI ile İngilizce Öğren</text>
      <text x="96" y="430" class="subline">PDF yükle · Kelimeye tıkla · Flash karta kaydet</text>
      <text x="96" y="520" class="brand">readways.com</text>
    </svg>`
  );
}

async function main() {
  const logo = await sharp(logoPath)
    .resize(320, null, { fit: "inside" })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const logoHeight = logoMeta.height ?? 72;

  const base = await sharp(backgroundSvg()).png().toBuffer();

  const png = await sharp(base)
    .composite([
      { input: logo, top: 96, left: 96 },
      { input: textOverlaySvg(), top: 0, left: 0 }
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(outputPath, png);
  console.log(`Wrote og-image.png (${WIDTH}x${HEIGHT}, logo ${logoMeta.width}x${logoHeight})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

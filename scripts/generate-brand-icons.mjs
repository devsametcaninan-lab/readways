/**
 * Generates favicon + PWA icons from the navbar logo (R symbol only).
 * Run: node scripts/generate-brand-icons.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "readways-logo-navbar-transparent.png");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "app");

const BRAND_PURPLE = "#7C3AED";
const CORNER_RADIUS_RATIO = 0.22;

/** Crop the left glyph region (R only, no wordmark). */
async function extractRSymbolBuffer() {
  const meta = await sharp(logoPath).metadata();
  const width = meta.width ?? 556;
  const height = meta.height ?? 126;
  const cropWidth = Math.min(Math.round(height * 0.88), Math.round(width * 0.22));

  return sharp(logoPath)
    .extract({ left: 0, top: 0, width: cropWidth, height })
    .png()
    .toBuffer();
}

function roundedSquareSvg(size, radius, fill) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${fill}"/>
    </svg>`
  );
}

async function renderIcon(rSymbol, size) {
  const radius = Math.round(size * CORNER_RADIUS_RATIO);
  const glyphSize = Math.round(size * 0.62);

  const glyph = await sharp(rSymbol)
    .resize(glyphSize, glyphSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(roundedSquareSvg(size, radius, BRAND_PURPLE))
    .png()
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  const rSymbol = await extractRSymbolBuffer();

  const outputs = [
    { name: "apple-touch-icon.png", size: 180, dir: publicDir },
    { name: "icon-192.png", size: 192, dir: publicDir },
    { name: "icon-512.png", size: 512, dir: publicDir }
  ];

  const pngBySize = new Map();

  for (const { name, size, dir } of outputs) {
    const png = await renderIcon(rSymbol, size);
    pngBySize.set(size, png);
    await writeFile(path.join(dir, name), png);
    console.log(`Wrote ${name} (${size}x${size})`);
  }

  const faviconSizes = [16, 32, 48];
  const faviconPngs = await Promise.all(
    faviconSizes.map(async (size) => renderIcon(rSymbol, size))
  );

  const faviconIco = await toIco(faviconPngs);
  await writeFile(path.join(publicDir, "favicon.ico"), faviconIco);
  await writeFile(path.join(appDir, "favicon.ico"), faviconIco);
  console.log("Wrote favicon.ico (16, 32, 48)");

  await writeFile(path.join(appDir, "icon.png"), faviconPngs[1]);
  console.log("Wrote app/icon.png (32x32)");

  const apple180 = pngBySize.get(180);
  if (apple180) {
    await writeFile(path.join(appDir, "apple-icon.png"), apple180);
    console.log("Wrote app/apple-icon.png (180x180)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

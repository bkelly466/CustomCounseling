// Regenerates public/images/og-default.jpg — the 1200x630 card that Facebook,
// LinkedIn, iMessage, Slack, and X render when someone shares any page.
//
// Run with: node scripts/build-og-image.mjs
//
// This is a ONE-OFF generator, not part of `astro build`. The output is
// committed so the site has no build-time dependency on this script, and so
// Cloudflare Pages never has to run sharp with a system font stack it may not
// have. Re-run it only when the source photo or the wording changes.
//
// Why it's generated at all: og:image must be a stable, absolute URL at a fixed
// 1200x630, which rules out Astro's <Image> pipeline (content-hashed filenames,
// responsive variants). A hand-made card in public/ is the simplest thing that
// works. When Eric approves a designed card, drop it in at the same path and
// delete this script.
//
// Text is drawn as SVG rather than composited from the logo file on purpose:
// custom-counseling-logo-transparent.png has near-black wordmark text, which is
// illegible over the darkened photo. Georgia stands in for Lora (the site's
// display face) — it is already the declared fallback in src/styles/global.css.
import sharp from 'sharp';

const W = 1200;
const H = 630;
const SOURCE = 'src/assets/images/hero-maroon-bells.jpg';
const OUTPUT = 'public/images/og-default.jpg';

// Same scrim direction as the home-page hero: light at the peaks, heavy at the
// base, so the white type at centre always clears contrast.
const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#232b2a" stop-opacity="0.30"/>
      <stop offset="45%"  stop-color="#232b2a" stop-opacity="0.60"/>
      <stop offset="100%" stop-color="#232b2a" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <text x="600" y="298" text-anchor="middle" font-family="Georgia, serif"
        font-style="italic" font-size="78" fill="#faf9f6">Custom Counseling</text>
  <text x="600" y="360" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="31" fill="#eccbb9">Eric Tulga, MA, LPC</text>
  <rect x="480" y="400" width="240" height="3" fill="#d4967d"/>
  <text x="600" y="466" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="30" fill="#faf9f6">Online counseling across Colorado</text>
</svg>`;

await sharp(SOURCE)
	.resize(W, H, { fit: 'cover', position: 'top' })
	.composite([{ input: Buffer.from(overlay) }])
	.jpeg({ quality: 82, mozjpeg: true })
	.toFile(OUTPUT);

const { width, height, size } = await sharp(OUTPUT).metadata();
console.log(`${OUTPUT} — ${width}x${height}, ${Math.round(size / 1024)} KB`);

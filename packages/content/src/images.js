/**
 * Seed imagery has to satisfy two conflicting needs: look like real photographs
 * during a demo, and still render with no network. `SEED_IMAGE_SOURCE=local`
 * swaps every URL for a generated duotone SVG in the site palette.
 */
const SOURCE = (typeof process !== "undefined" && process.env?.SEED_IMAGE_SOURCE) || "picsum";
/** FNV-1a — stable across runs and platforms, unlike hashCode-style sums. */
function hash(seed) {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
export function seededInt(seed, min, max) {
    return min + (hash(seed) % (max - min + 1));
}
export function seededPick(seed, items) {
    // Callers always pass non-empty literals; index is provably in range.
    return items[hash(seed) % items.length];
}
const DUOTONE_PAIRS = [
    ["#0B0E13", "#B08D4F"],
    ["#0B0E13", "#6BA3B0"],
    ["#141922", "#B08D4F"],
    ["#141922", "#7C8493"],
    ["#0B0E13", "#6E2438"],
];
/**
 * Blur placeholders must be tiny — they are inlined into the HTML payload.
 * A 4-stop gradient reads as an out-of-focus photo once next/image scales it up.
 */
function blurSvg(seed) {
    const pair = seededPick(seed, DUOTONE_PAIRS);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${pair[0]}"/><stop offset="100%" stop-color="${pair[1]}"/></linearGradient></defs><rect width="8" height="6" fill="url(#g)"/></svg>`;
    return `data:image/svg+xml;base64,${base64(svg)}`;
}
function base64(input) {
    if (typeof Buffer !== "undefined")
        return Buffer.from(input).toString("base64");
    // Browser/edge fallback
    return btoa(unescape(encodeURIComponent(input)));
}
/** Full-size offline placeholder: duotone field + grain, framed like a print. */
function localSvg(seed, w, h, label) {
    const pair = seededPick(seed, DUOTONE_PAIRS);
    const angle = seededInt(seed, 0, 3) * 45;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${pair[0]}"/>
      <stop offset="100%" stop-color="${pair[1]}"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" filter="url(#n)" opacity="0.18"/>
  <text x="50%" y="50%" fill="#EDE6D8" fill-opacity="0.5" font-family="monospace" font-size="${Math.round(w / 26)}" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${label.toUpperCase()}</text>
</svg>`;
    return `data:image/svg+xml;base64,${base64(svg)}`;
}
const PALETTES = [
    ["B08D4F", "6BA3B0", "0B0E13", "EDE6D8"],
    ["6E2438", "B08D4F", "141922", "EDE6D8"],
    ["6BA3B0", "7C8493", "0B0E13", "EDE6D8"],
    ["B08D4F", "6E2438", "0B0E13", "7C8493"],
];
/**
 * Builds an Image record from a stable seed so the same memory always shows the
 * same photograph across restarts and between the API and the web app.
 */
export function seedImage(seed, opts = {}) {
    const width = opts.width ?? 1600;
    const height = opts.height ?? 1067;
    const label = opts.label ?? seed.replace(/-/g, " ");
    const picsumId = seededInt(seed, 1, 1080);
    const url = SOURCE === "local"
        ? localSvg(seed, width, height, label)
        : `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
    const squareUrl = SOURCE === "local"
        ? localSvg(`${seed}-sq`, 800, 800, label)
        : `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`;
    return {
        url,
        squareUrl,
        width,
        height,
        blurDataURL: blurSvg(seed),
        palette: [...seededPick(seed, PALETTES)],
        storageKey: `seed/${seed}-${picsumId}`,
    };
}
export function seedImages(seeds, opts = {}) {
    return seeds.map((s) => seedImage(s, opts));
}

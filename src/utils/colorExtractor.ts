/**
 * Utility to extract dominant and primary colors from an image URL using an HTML5 Canvas.
 * Optimized for local assets and remote URLs with graceful fallback.
 */

export interface ExtractedColorPalette {
  primary: string;         // e.g. "rgb(180, 83, 9)"
  secondary: string;       // deeper tone, e.g. "rgb(55, 20, 5)"
  ambient: string;         // glowing backdrop color e.g. "rgba(180, 83, 9, 0.35)"
  accent: string;          // highlight for chips/badges
  gradientDark: string;    // rich dark gradient for card background
  gradientLight: string;   // clean light gradient for card background
  isDark: boolean;
}

const DEFAULT_PALETTE: ExtractedColorPalette = {
  primary: 'rgb(217, 119, 6)',
  secondary: 'rgb(40, 24, 5)',
  ambient: 'rgba(217, 119, 6, 0.35)',
  accent: 'rgb(251, 191, 36)',
  gradientDark: 'linear-gradient(135deg, rgba(70, 35, 10, 0.95) 0%, rgba(25, 15, 8, 0.98) 50%, rgba(10, 10, 12, 1) 100%)',
  gradientLight: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.8) 50%, rgba(245, 245, 247, 0.95) 100%)',
  isDark: true,
};

// Memory cache so we don't re-sample the same cover art
const colorCache = new Map<string, ExtractedColorPalette>();

/**
 * Extracts a dominant vibrant color palette from an image URL
 */
export function extractColorsFromImage(
  url: string
): Promise<ExtractedColorPalette> {
  if (!url) return Promise.resolve(DEFAULT_PALETTE);

  if (colorCache.has(url)) {
    return Promise.resolve(colorCache.get(url)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        const size = 50;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number; score: number } } = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // skip transparent

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          // Skip nearly black or nearly white or completely flat grays
          if (lum < 30 || lum > 235) continue;

          // Quantize to reduce buckets
          const qR = Math.round(r / 20) * 20;
          const qG = Math.round(g / 20) * 20;
          const qB = Math.round(b / 20) * 20;
          const key = `${qR},${qG},${qB}`;

          // Higher score for saturated colors
          const saturation = max === 0 ? 0 : delta / max;
          const score = (saturation * 2 + 1) * (1 - Math.abs(lum - 120) / 120);

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: qR, g: qG, b: qB, count: 1, score };
          } else {
            colorBuckets[key].count += 1;
            colorBuckets[key].score += score;
          }
        }

        const candidates = Object.values(colorBuckets);
        if (candidates.length === 0) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        // Sort by total score (saturation + prevalence)
        candidates.sort((a, b) => b.score - a.score);
        const top = candidates[0];

        const r = top.r;
        const g = top.g;
        const b = top.b;

        // Generate secondary darker shade
        const darkR = Math.max(0, Math.round(r * 0.25));
        const darkG = Math.max(0, Math.round(g * 0.25));
        const darkB = Math.max(0, Math.round(b * 0.25));

        // Generate medium shade
        const medR = Math.max(0, Math.round(r * 0.55));
        const medG = Math.max(0, Math.round(g * 0.55));
        const medB = Math.max(0, Math.round(b * 0.55));

        // Generate accent (brightened)
        const accR = Math.min(255, Math.round(r * 1.35 + 25));
        const accG = Math.min(255, Math.round(g * 1.35 + 25));
        const accB = Math.min(255, Math.round(b * 1.35 + 25));

        const palette: ExtractedColorPalette = {
          primary: `rgb(${r}, ${g}, ${b})`,
          secondary: `rgb(${darkR}, ${darkG}, ${darkB})`,
          ambient: `rgba(${r}, ${g}, ${b}, 0.45)`,
          accent: `rgb(${accR}, ${accG}, ${accB})`,
          gradientDark: `linear-gradient(135deg, rgba(${medR}, ${medG}, ${medB}, 0.95) 0%, rgba(${darkR}, ${darkG}, ${darkB}, 0.98) 60%, rgba(10, 10, 14, 0.98) 100%)`,
          gradientLight: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.22) 0%, rgba(${r}, ${g}, ${b}, 0.08) 50%, rgba(255, 255, 255, 0.9) 100%)`,
          isDark: true,
        };

        colorCache.set(url, palette);
        resolve(palette);
      } catch (err) {
        console.warn('Could not extract image color, using fallback:', err);
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      resolve(DEFAULT_PALETTE);
    };

    img.src = url;
  });
}

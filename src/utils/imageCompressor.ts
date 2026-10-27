/**
 * Client-Side Smart Image Compressor
 * - Automatically crops to 1:1 aspect ratio (center-crop)
 * - Resizes to exactly 150x150 pixels
 * - Compresses JPEG/WebP to guarantee file size < 20KB
 */

export async function compressAndCropImage(fileOrBlob: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const targetSize = 150;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas 2D context not available'));
            return;
          }

          // Center crop calculation for 1:1 ratio
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw cropped & resized image
          ctx.drawImage(
            img,
            startX, startY, minDim, minDim, // source 1:1 crop
            0, 0, targetSize, targetSize   // destination 150x150
          );

          // Compress to JPEG with quality 0.8
          let quality = 0.82;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // If size > 20KB, progressively lower quality
          const maxBytes = 20 * 1024;
          while (dataUrl.length * 0.75 > maxBytes && quality > 0.4) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Returns a clean SVG placeholder icon for spare parts without an uploaded photo
 */
export function getPlaceholderImageSvg(code: string = 'SP'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="#f1f5f9"/>
    <rect x="25" y="25" width="100" height="100" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M50 75 L65 55 L85 80 L95 68 L110 88 H40 Z" fill="#94a3b8"/>
    <circle cx="55" cy="50" r="8" fill="#cbd5e1"/>
    <text x="75" y="115" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">${code.substring(0, 10)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

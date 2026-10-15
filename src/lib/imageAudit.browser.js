import { analyzePixels } from './imageAudit.js';

const ANALYSIS_SIZE = 128;
const THUMB_SIZE = 220;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image we can read. Choose a JPG or PNG photo.'));
    };
    img.src = url;
  });
}

function drawScaled(img, size) {
  const canvas = document.createElement('canvas');
  const ratio = img.width / img.height;
  canvas.width = ratio >= 1 ? size : Math.round(size * ratio);
  canvas.height = ratio >= 1 ? Math.round(size / ratio) : size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/**
 * Read a photo file, analyse it locally and make a small thumbnail for the review.
 * @param {File} file
 * @returns {Promise<{metrics: object, thumbnail: string}>}
 */
export async function auditImageFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const img = await loadImage(file);

  const small = drawScaled(img, ANALYSIS_SIZE);
  const { data } = small.ctx.getImageData(0, 0, small.canvas.width, small.canvas.height);
  const metrics = analyzePixels(data, small.canvas.width, small.canvas.height);

  const thumb = drawScaled(img, THUMB_SIZE);
  const thumbnail = thumb.canvas.toDataURL('image/jpeg', 0.6);

  return { metrics, thumbnail };
}

const THUMB_W = 1280;
const THUMB_H = 720;

export interface GospelThumbnailOptions {
  backgroundImageUrl: string;
  title: string;
  speaker: string;
  ministry: string;
  scripture: string;
  accentRgb?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load thumbnail background'));
    img.src = src;
  });
}

/** Render a 1280×720 thumbnail card from a video frame or image URL plus overlay text. */
export async function renderGospelThumbnailDataUrl(options: GospelThumbnailOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = THUMB_W;
  canvas.height = THUMB_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const bg = await loadImage(options.backgroundImageUrl);
  const scale = Math.max(THUMB_W / bg.width, THUMB_H / bg.height);
  const drawW = bg.width * scale;
  const drawH = bg.height * scale;
  const dx = (THUMB_W - drawW) / 2;
  const dy = (THUMB_H - drawH) / 2;
  ctx.drawImage(bg, dx, dy, drawW, drawH);

  const gradient = ctx.createLinearGradient(0, 0, 0, THUMB_H);
  gradient.addColorStop(0, 'rgba(15, 15, 15, 0.15)');
  gradient.addColorStop(0.45, 'rgba(15, 15, 15, 0.55)');
  gradient.addColorStop(1, 'rgba(5, 5, 5, 0.92)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  const accent = options.accentRgb || '251, 191, 36';
  ctx.fillStyle = `rgba(${accent}, 0.18)`;
  ctx.fillRect(48, THUMB_H - 200, THUMB_W - 96, 4);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px Georgia, "Times New Roman", serif';
  const title = (options.title || 'Sunday Worship Service').toUpperCase();
  wrapText(ctx, title, 56, THUMB_H - 220, THUMB_W - 112, 62, 2);

  ctx.font = '600 28px system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(options.speaker || 'Speaker', 56, THUMB_H - 96);

  ctx.font = '500 22px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(options.ministry || 'Ministry', 56, THUMB_H - 58);

  if (options.scripture?.trim()) {
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillStyle = `rgb(${accent})`;
    const badge = options.scripture.trim().toUpperCase();
    const badgeW = ctx.measureText(badge).width + 28;
    ctx.fillStyle = `rgba(${accent}, 0.15)`;
    roundRect(ctx, THUMB_W - badgeW - 48, 48, badgeW, 36, 8);
    ctx.fill();
    ctx.fillStyle = `rgb(${accent})`;
    ctx.fillText(badge, THUMB_W - badgeW - 34, 72);
  }

  return canvas.toDataURL('image/jpeg', 0.88);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  let line = '';
  let lineCount = 0;
  let cursorY = y;

  for (let n = 0; n < words.length; n++) {
    const test = line ? `${line} ${words[n]}` : words[n];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[n];
      lineCount += 1;
      cursorY += lineHeight;
      if (lineCount >= maxLines - 1) {
        ctx.fillText(`${line}…`, x, cursorY);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

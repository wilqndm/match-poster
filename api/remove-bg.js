// pages/api/remove-bg.js
import { createCanvas, loadImage } from 'canvas';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let { imageBase64 } = req.body || {};
  if (!imageBase64) return res.status(400).send('Brak imageBase64 w body.');

  // Usuń prefix dataURL jeśli jest
  const commaIdx = imageBase64.indexOf(',');
  if (commaIdx !== -1) {
    imageBase64 = imageBase64.slice(commaIdx + 1);
  }

  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const img = await loadImage(buffer);

    const w = img.width;
    const h = img.height;

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // kolor tła z lewego górnego rogu
    const bgR = data[0],
      bgG = data[1],
      bgB = data[2];
    const tolerance = 80;

    const withinTol = (r, g, b) =>
      Math.abs(r - bgR) <= tolerance &&
      Math.abs(g - bgG) <= tolerance &&
      Math.abs(b - bgB) <= tolerance;

    const visited = new Uint8Array(w * h);
    const stack = [];

    // dodaj wszystkie piksele z brzegów
    for (let x = 0; x < w; x++) {
      stack.push([x, 0]);
      stack.push([x, h - 1]);
    }
    for (let y = 0; y < h; y++) {
      stack.push([0, y]);
      stack.push([w - 1, y]);
    }

    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= w || y >= h) continue;

      const idx = y * w + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const i = idx * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];

      if (withinTol(r, g, b)) {
        data[i + 3] = 0; // alfa = przezroczyste

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const outBuffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(outBuffer);
  } catch (err) {
    console.error('Błąd /api/remove-bg:', err);
    return res.status(500).send('Błąd serwera: ' + err.message);
  }
}

// pages/api/remove-bg.js
import { Buffer } from 'buffer';
import Jimp from 'jimp';

// Wyłącz limit bodyParsera w Next.js (bo obraz base64 bywa spory)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
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
    let img = await Jimp.read(buffer);

    const w = img.bitmap.width;
    const h = img.bitmap.height;

    // Pobieramy kolor w narożniku (zakładamy, że tło jest jednolite)
    const bgColor = Jimp.intToRGBA(img.getPixelColor(0, 0));

    // Utwórz maskę flood fill od krawędzi
    const visited = new Set();
    const stack = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ];

    const tolerance = 40; // dopuszczalna różnica koloru (0–255)

    const withinTol = (c1, c2) =>
      Math.abs(c1.r - c2.r) <= tolerance &&
      Math.abs(c1.g - c2.g) <= tolerance &&
      Math.abs(c1.b - c2.b) <= tolerance;

    while (stack.length) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (x < 0 || y < 0 || x >= w || y >= h || visited.has(key)) continue;
      visited.add(key);

      const col = Jimp.intToRGBA(img.getPixelColor(x, y));
      if (withinTol(col, bgColor)) {
        // Zrób przezroczysty
        img.setPixelColor(Jimp.rgbaToInt(col.r, col.g, col.b, 0), x, y);

        // Dodaj sąsiadów
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    const outBuffer = await img.getBufferAsync(Jimp.MIME_PNG);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(outBuffer);
  } catch (err) {
    console.error('Błąd /api/remove-bg:', err);
    return res.status(500).send('Błąd serwera: ' + err.message);
  }
}

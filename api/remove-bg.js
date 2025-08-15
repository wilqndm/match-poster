import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb', // base64 bywa spore
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let { imageBase64 } = req.body || {};
  if (!imageBase64) return res.status(400).send('Brak imageBase64 w body.');

  // Akceptuj zarówno czyste base64, jak i dataURL — obetnij prefix jeśli jest
  const commaIdx = imageBase64.indexOf(',');
  if (commaIdx !== -1) {
    imageBase64 = imageBase64.slice(commaIdx + 1);
  }

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) return res.status(500).send('Brak REMOVE_BG_API_KEY w env.');

  try {
    const form = new FormData();
    form.append('image_file_b64', imageBase64);
    form.append('size', 'auto');

    const r = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...form.getHeaders(),               // ⬅⬅ KLUCZOWE: boundary dla multipart/form-data
      },
      body: form,
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt); // przekaż kod remove.bg (401/402/403/415 itd.)
    }

    // node-fetch@2 -> response.buffer() jest OK
    const buffer = await r.buffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Błąd /api/remove-bg:', err);
    return res.status(500).send('Błąd serwera: ' + err.message);
  }
}

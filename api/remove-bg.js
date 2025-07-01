import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { imageBase64 } = req.body;

  const form = new FormData();
  form.append('image_file_b64', imageBase64);
  form.append('size', 'auto');

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY
      },
      body: form
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).send(error);
    }

    const buffer = await response.buffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Błąd serwera: ' + err.message);
  }
}

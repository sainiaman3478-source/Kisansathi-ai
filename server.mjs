import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

async function callGemini(prompt, imageBase64 = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] })
  });
  const data = await res.json();
  if (!data.candidates) throw new Error(JSON.stringify(data));
  return data.candidates[0].content.parts[0].text;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const prompt = `Tu KisanSaathi AI hai, ek desi kisan dost. Sawal: ${message}. Jawab hamesha Hindi me, chhota aur kisan ki bhasha me de.`;
    const reply = await callGemini(prompt);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI service error", detail: e.message });
  }
});

app.post('/api/diagnose', async (req, res) => {
  try {
    const { image } = req.body; // base64
    const base64 = image.includes(',')? image.split(',')[1] : image;
    const prompt = `Ye fasal ki photo hai. Bimari ka naam, karan, aur desi ilaj Hindi me bata. JSON me de: {disease, cause, treatment}`;
    const reply = await callGemini(prompt, base64);
    res.json({ result: reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI service error", detail: e.message });
  }
});

app.get('/api/mandi', async (req, res) => {
  res.json([{ mandi: "Etawah", crop: "Gehoon", price: "₹2250/qtl" }]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Live on", port));

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// --- YAHI TERA DIYA HUA FINAL FUNCTION ---
async function callGemini(prompt, imageBase64 = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("KEY missing in Render Env");

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  const body = JSON.stringify({ contents: [{ parts }] });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
  let lastError = "";
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const data = await res.json();
    if (data.candidates) return data.candidates[0].content.parts[0].text;
    lastError = JSON.stringify(data).slice(0,500);
    console.log(`Model ${m} failed:`, lastError);
  }
  throw new Error(lastError);
}
// --- KHATAM ---

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    const prompt = `Tu KisanSathi AI hai. Is kisan sawal ka jawab de: ${message}`;
    const reply = await callGemini(prompt, image);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));

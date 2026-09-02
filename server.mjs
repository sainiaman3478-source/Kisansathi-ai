import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function callGemini(prompt, imageBase64 = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing on Render");

  const parts = [{ text: prompt }];
  if (imageBase64) parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  const body = JSON.stringify({ contents: [{ parts }] });

  // Sahi model naam
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data = await res.json();
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  // Agar 1.5 fail ho toh 2.0 try karo
  const url2 = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res2 = await fetch(url2, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data2 = await res2.json();
  if (data2.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data2.candidates[0].content.parts[0].text;
  }
  throw new Error(JSON.stringify(data2).slice(0,1000));
}

app.post('/api/chat', async (req, res) => {
  try {
    const reply = await callGemini(`Tu KisanSaathi AI hai. Hindi me jawab de: ${req.body.message}`, req.body.image);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const distPath = path.join(__dirname, '../dist');
if(fs.existsSync(path.join(distPath, 'index.html'))){
  app.use(express.static(distPath));
  app.get('*', (req,res) => {
    if(req.path.startsWith('/api')) return res.status(404).json({error:'api'});
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req,res) => res.json({status:"API Live"}));
}
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));

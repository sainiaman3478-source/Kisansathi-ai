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
  if (!key) throw new Error("KEY missing");
  const parts = [{ text: prompt }];
  if (imageBase64) parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  const body = JSON.stringify({ contents: [{ parts }] });

  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${key}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const data = await res.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) return data.candidates[0].content.parts[0].text;
  }
  throw new Error("AI fail");
}

app.post('/api/chat', async (req, res) => {
  try {
    const reply = await callGemini(`Tu KisanSaathi AI hai. Hindi me jawab de: ${req.body.message}`, req.body.image);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- YEH FIX HAI WHITE PAGE KA ---
const distPath = path.join(__dirname, 'dist'); // root me dist
console.log("Checking dist at:", distPath, "Exists:", fs.existsSync(distPath));

if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'api not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ status: "API Live - dist not found at " + distPath }));
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));

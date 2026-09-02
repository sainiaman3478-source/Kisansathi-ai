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

// 100% WORKING GEMINI FUNCTION - v1
async function callGemini(prompt, imageBase64 = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("KEY missing in Render Env");

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  const body = JSON.stringify({ contents: [{ parts }] });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
  let lastError = "";

  for (const m of models) {
    // yahan v1 kar diya - v1beta fail ho raha tha
    const url = `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      lastError = JSON.stringify(data).slice(0,1000);
      console.log(`Model ${m} failed:`, lastError);
    } catch (err) {
      lastError = err.message;
      console.log(`Model ${m} error:`, lastError);
    }
  }
  throw new Error(lastError);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    const prompt = `Tu KisanSathi AI hai, ek digital kisan dost. Hindi me chhota aur sahi jawab de. Sawal: ${message}`;
    const reply = await callGemini(prompt, image);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// DIST ka crash fix
const possiblePaths = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, './dist'),
  path.join(__dirname, '../../dist')
];
let distPath = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html')));
if(distPath) {
  app.use(express.static(distPath));
  app.get('*', (req,res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({error: 'API not found'});
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req,res) => res.json({ status: "API Live", dist: "not found but API working" }));
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));

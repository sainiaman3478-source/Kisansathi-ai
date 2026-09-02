import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Render me GEMINI_API_KEY nahi hai");
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data = await res.json();
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error("Google Error: " + JSON.stringify(data));
}

app.post('/api/chat', async (req, res) => {
  try {
    const reply = await callGemini(req.body.message);
    res.json({ reply });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({error:'api'});
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Live on " + PORT));

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---- TERA CHALU AI - NO CHANGE, TEZ WALA ----
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.5-flash"];
  let lastErr = "";
  for (const model of models) {
    try {
      console.log("Trying", model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tum AI Kisan ho, Hindi me short help karo, ** mat use karo: ${prompt}` }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
        })
      });
      const data = await r.json();
      if (!r.ok) { lastErr = data.error?.message; console.log(model, lastErr); continue; }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) { lastErr = e.message; }
  }
  throw new Error(lastErr);
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ---- NAYA - REAL MANDI - AI KO TOUCH NAHI ----
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    if (!apiKey) return res.json({ mandi: [], msg: "DATA_GOV_API_KEY missing in Render" });
    const state = req.query.state || "Uttar Pradesh";
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=20&filters[state.keyword]=${state}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json({ mandi: data.records || [], source: "Real - data.gov.in" });
  } catch (e) {
    res.json({ mandi: [], error: e.message });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running"));

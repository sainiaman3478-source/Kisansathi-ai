import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.5-flash"];
  let lastErr = "";
  for (const model of models) {
    try {
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
      if (!r.ok) { lastErr = data.error?.message; continue; }
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
    res.status(500).json({ error: e.message });
  }
});

// FIXED REAL MANDI - ERROR 200 KHATAM
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    if (!apiKey) return res.json({ mandi: [], msg: "API Key missing" });
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;
    const r = await fetch(url);
    const data = await r.json();
    let records = data.records || [];
    const qState = (req.query.state || "").toLowerCase();
    const qCommodity = (req.query.commodity || req.query.fasal || "").toLowerCase();
    const qMandi = (req.query.mandi || "").toLowerCase();
    if(qState) records = records.filter(x => (x.state||"").toLowerCase().includes(qState));
    if(qCommodity) records = records.filter(x => (x.commodity||"").toLowerCase().includes(qCommodity));
    if(qMandi) records = records.filter(x => (x.market||"").toLowerCase().includes(qMandi));
    if(records.length === 0) records = data.records?.slice(0,20) || [];
    const mandi = records.map(rec => ({
      commodity: rec.commodity,
      state: rec.state,
      district: rec.district,
      market: rec.market,
      min: rec.min_price,
      max: rec.max_price,
      modal: rec.modal_price,
      date: rec.arrival_date
    }));
    res.json({ mandi, source: "Real - data.gov.in", total: mandi.length });
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

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
  if (!key) throw new Error("GEMINI_API_KEY missing");

  // TERA CHALU WALA AI - NO CHANGE
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"];

  let lastErr = "";
  for (const model of models) {
    try {
      console.log("Trying", model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me chota jawab do: ${prompt}` }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
        })
      });
      const data = await r.json();
      if (!r.ok) { lastErr = data.error?.message || JSON.stringify(data); console.log(model, "FAIL:", lastErr); continue; }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { console.log(model, "OK"); return text; }
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

// MANDI - DEBUG + LIVE + DEMO - UPDATED
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const q = (req.query.commodity || req.query.fasal || "").toLowerCase();
    let liveMandi = [];

    if (apiKey) {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;
        const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const data = await r.json();
        
        console.log("GOV RESPONSE:", JSON.stringify(data).slice(0, 800));

        if (data.records && data.records.length > 0) {
          liveMandi = data.records;
        }
      } catch (e) {
        console.log("GOV API FETCH FAIL:", e.message);
      }
    }

    let records = liveMandi;
    if (records.length === 0) {
      console.log("Using DEMO data, Live empty");
      records = [
        { commodity: "Wheat", state: "Uttar Pradesh", district: "Sambhal", market: "Sambhal", min_price: "2150", max_price: "2400", modal_price: "2250", arrival_date: "2026-09-02" },
        { commodity: "Tomato", state: "UP", district: "Sambhal", market: "Sambhal", min_price: "1200", max_price: "2000", modal_price: "1600", arrival_date: "2026-09-02" },
        { commodity: "Potato", state: "UP", district: "Sambhal", market: "Sambhal", min_price: "800", max_price: "1500", modal_price: "1100", arrival_date: "2026-09-02" }
      ];
    }

    let mandi = records.map(rec => ({
      commodity: rec.commodity, state: rec.state, district: rec.district, market: rec.market,
      min: rec.min_price, max: rec.max_price, modal: rec.modal_price, date: rec.arrival_date
    }));

    if (q) {
      const f = mandi.filter(x => (x.commodity||"").toLowerCase().includes(q));
      if (f.length > 0) mandi = f;
    }

    res.json({ mandi, total: mandi.length, source: liveMandi.length > 0 ? "LIVE" : "DEMO" });
  } catch (e) {
    console.log("Mandi Crash:", e.message);
    res.json({ mandi: [{ commodity: "Wheat", state: "UP", market: "Sambhal", min: "2150", max: "2400", modal: "2250", date: "today" }], source: "Fallback" });
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
app.listen(PORT, () => console.log("Running on", PORT));

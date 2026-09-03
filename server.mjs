import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - TERA CHALU WALA - NO CHANGE =====
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"];
  let lastErr = "";
  for (const model of models) {
    try {
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
      if (!r.ok) { lastErr = data.error?.message || JSON.stringify(data); continue; }
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

// ===== MANDI - FINAL FIX - RED ERROR KHATAM =====
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const q = (req.query.commodity || "").toLowerCase();
    let liveRecords = [];

    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&offset=0`;
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const data = await r.json();
      if (data.records && data.records.length > 0) liveRecords = data.records;
      console.log("LIVE records:", liveRecords.length);
    } catch (e) {
      console.log("Live fail:", e.message);
    }

    let records = liveRecords;
    if (records.length === 0) {
      console.log("Using DEMO fallback");
      records = [
        { commodity: "Tomato", state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", min_price: "1500", max_price: "2200", modal_price: "1800", arrival_date: "2026-09-03" },
        { commodity: "Wheat", state: "Uttar Pradesh", district: "Sambhal", market: "Sambhal", min_price: "2150", max_price: "2400", modal_price: "2250", arrival_date: "2026-09-03" },
        { commodity: "Potato", state: "UP", district: "Sambhal", market: "Sambhal", min_price: "1000", max_price: "1600", modal_price: "1300", arrival_date: "2026-09-03" },
        { commodity: "Onion", state: "UP", district: "Moradabad", market: "Moradabad", min_price: "1200", max_price: "1800", modal_price: "1500", arrival_date: "2026-09-03" },
        { commodity: "Mustard", state: "UP", district: "Sambhal", market: "Sambhal", min_price: "5200", max_price: "5800", modal_price: "5500", arrival_date: "2026-09-03" }
      ];
    }

    let mandi = records.map(x => ({
      commodity: x.commodity, state: x.state, district: x.district, market: x.market,
      min: x.min_price, max: x.max_price, modal: x.modal_price, date: x.arrival_date
    }));

    if (q) {
      const filtered = mandi.filter(x => (x.commodity || "").toLowerCase().includes(q));
      if (filtered.length > 0) mandi = filtered;
    }

    // HAMESHA 200 OK bhejega, kabhi error nahi
    res.json({ mandi, total: mandi.length, source: liveRecords.length > 0 ? "LIVE GOV" : "DEMO" });
  } catch (e) {
    res.json({ mandi: [{ commodity: "Tomato", state: "UP", market: "Chandausi", min: "1500", max: "2200", modal: "1800", date: "today" }], total: 1, source: "Fallback" });
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

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// --- 1. KISAN AI - FIXED ---
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing in Render");
  const models = ["gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-2.0-flash"];
  let lastErr = "All models failed";
  for (const model of models) {
    try {
      console.log("Trying", model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me short jawab do: ${prompt}` }] }],
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
    const reply = await callGemini(req.body?.message || "namaste");
    res.json({ reply });
  } catch (e) {
    console.error("AI Error:", e.message);
    res.status(500).json({ error: e.message, reply: "AI Key / Model Error - Render logs check karo" });
  }
});

// --- 2. MANDI - FIXED + FALLBACK ---
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    if (apiKey) {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50`;
        const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const data = await r.json();
        if (data.records && data.records.length > 0) {
          let records = data.records;
          const q = (req.query.commodity || "").toLowerCase();
          if (q) records = records.filter(x => (x.commodity||"").toLowerCase().includes(q));
          const mandi = records.slice(0,20).map(rec => ({
            commodity: rec.commodity, state: rec.state, district: rec.district, market: rec.market,
            min: rec.min_price, max: rec.max_price, modal: rec.modal_price, date: rec.arrival_date
          }));
          if (mandi.length > 0) return res.json({ mandi, source: "Real", total: mandi.length });
        }
      } catch (e) { console.log("Real Mandi fail, using fallback", e.message); }
    }
    // FALLBACK - Kabhi band nahi hoga
    const mock = [
      { commodity: "Wheat", state: "Uttar Pradesh", district: "Sambhal", market: "Sambhal", min: "2100", max: "2400", modal: "2250", date: "2026-09-02" },
      { commodity: "Wheat", state: "Punjab", district: "Ludhiana", market: "Ludhiana", min: "2200", max: "2500", modal: "2350", date: "2026-09-02" },
      { commodity: "Paddy", state: "UP", district: "Bareilly", market: "Bareilly", min: "1900", max: "2100", modal: "2000", date: "2026-09-02" }
    ];
    let filtered = mock;
    const q = (req.query.commodity || "").toLowerCase();
    if (q) filtered = mock.filter(x => x.commodity.toLowerCase().includes(q));
    if (filtered.length === 0) filtered = mock;
    res.json({ mandi: filtered, source: "Fallback (Real API fail)", total: filtered.length });

  } catch (e) {
    res.json({ mandi: [], error: e.message });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, hasGemini: !!process.env.GEMINI_API_KEY, hasMandiKey: !!process.env.DATA_GOV_API_KEY }));
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running on", PORT));

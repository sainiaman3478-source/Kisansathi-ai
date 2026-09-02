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

  // NAYE MODELS - Google ne bola hai 3.6 use karo
  const models = ["gemini-3.6-flash", "gemini-3-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

  let lastErr = "";
  for (const model of models) {
    try {
      console.log("Trying", model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me short help karo: ${prompt}` }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
        })
      });
      const data = await r.json();
      if (!r.ok) { lastErr = data.error?.message; console.log(model, "fail:", lastErr); continue; }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { console.log(model, "Success"); return text; }
    } catch (e) { lastErr = e.message; }
  }
  throw new Error(lastErr);
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message || "Namaste");
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// MANDI - ERROR 200 FIX
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    let mandi = [];
    if (apiKey) {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&offset=0`;
        const r = await fetch(url);
        const data = await r.json();
        console.log("Mandi API Status:", data.status, "Records:", data.records?.length);
        if (data.records && Array.isArray(data.records)) {
           mandi = data.records.map(rec => ({
            commodity: rec.commodity, state: rec.state, district: rec.district, market: rec.market,
            min: rec.min_price, max: rec.max_price, modal: rec.modal_price, date: rec.arrival_date
          }));
        }
      } catch (e) { console.log("Real mandi fail", e.message); }
    }
    // Agar real empty hai toh fallback dega, error 200 nahi ayega
    if (mandi.length === 0) {
      mandi = [
        { commodity: "Tomato", state: "Uttar Pradesh", district: "Sambhal", market: "Sambhal", min: "1000", max: "2000", modal: "1500", date: new Date().toISOString().split('T')[0] },
        { commodity: "Wheat", state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", min: "2100", max: "2400", modal: "2250", date: new Date().toISOString().split('T')[0] },
      ];
      return res.json({ mandi, source: "Fallback - Real API returned 0 records", total: mandi.length });
    }
    // Filter
    const q = (req.query.commodity || req.query.fasal || "").toLowerCase();
    if (q) { const f = mandi.filter(x => (x.commodity||"").toLowerCase().includes(q)); if(f.length>0) mandi = f; }
    res.json({ mandi: mandi.slice(0,30), source: "Real - data.gov.in", total: mandi.length });
  } catch (e) {
    console.error("Mandi final error", e);
    res.json({ mandi: [], error: e.message }); // Kabhi 500 nahi, hamesha 200 with data
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

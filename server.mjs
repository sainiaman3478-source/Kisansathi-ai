import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - TERA CHALU WALA CODE - NO CHANGE =====
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");
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

// ===== MANDI - FINAL 100% LIVE =====
app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key missing", mandi: [] });

    const q = (req.query.commodity || req.query.fasal || "").toLowerCase();
    const limit = 100;
    // Filter ke saath URL - taki sahi data aaye
    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}&offset=0`;
    if (q) {
      url += `&filters[commodity]=${encodeURIComponent(q)}`;
    }

    console.log("Fetching LIVE:", url.slice(0, 150));
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await r.json();
    
    console.log("GOV STATUS:", r.status, "TOTAL:", data.total, "COUNT:", data.count, "RECORDS:", data.records?.length);

    if (!data.records) {
      console.log("GOV RAW:", JSON.stringify(data).slice(0, 1000));
      return res.status(500).json({ error: "Gov returned no records", mandi: [], raw: data });
    }

    let mandi = data.records.map(x => ({
      commodity: x.commodity,
      state: x.state,
      district: x.district,
      market: x.market,
      variety: x.variety,
      min: x.min_price,
      max: x.max_price,
      modal: x.modal_price,
      date: x.arrival_date
    }));

    console.log("Sending LIVE mandi:", mandi.length);
    res.json({ mandi, total: mandi.length, source: "LIVE GOV - data.gov.in" });

  } catch (e) {
    console.log("Mandi Crash:", e.message);
    res.status(500).json({ error: e.message, mandi: [] });
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

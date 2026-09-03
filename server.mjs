import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - WITH FALLBACK SYSTEM =====
async function callGemini(prompt, isImage = false, imageData = null) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  // 2.0 sabse stable hai, usko pehle rakha hai
  const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.6-flash"];

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      let body;
      if (isImage) {
        body = {
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: imageData.mime, data: imageData.data } }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.4 }
        };
      } else {
        body = {
          contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me chota jawab do: ${prompt}` }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
        };
      }

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await r.json();

      if (!r.ok) {
        console.log(`${model} failed: ${data.error?.message?.slice(0,100)}`);
        continue; // agla model try karo
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) {
      console.log(`${model} error: ${e.message}`);
      continue;
    }
  }
  throw new Error("Sab models busy hai, 1 min baad try karo");
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Chat hit:", req.body?.message);
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    console.error("CHAT ERROR:", e.message);
    res.json({ reply: `Server thoda busy hai, 30 sec baad try karo.` });
  }
});

app.post("/api/crop-doctor", async (req, res) => {
  try {
    const { image, mimeType, cropName, symptoms } = req.body;
    if (!image) return res.json({ reply: "Photo nahi mili." });
    const base64Data = image.includes(",")? image.split(",")[1] : image;
    const promptText = `Tum expert Krishi Doctor ho. Fasal: ${cropName || 'Pata nahi'}, Lakshan: ${symptoms || 'Nahi'} - Hindi me bimari, dawa, bachav batao.`;

    const reply = await callGemini(promptText, true, { mime: mimeType || "image/jpeg", data: base64Data });
    return res.json({ reply });
  } catch (e) {
    console.error("Crop Doctor Error:", e.message);
    return res.json({ reply: `Crop Doctor busy hai, thodi der baad try karo.` });
  }
});

app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const reqState = (req.query.state || "").toLowerCase().trim();
    const reqCommodity = (req.query.commodity || "").toLowerCase().trim();
    const reqMarket = (req.query.market || "").toLowerCase().trim();
    let liveRecords = [];
    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&offset=0`;
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const data = await r.json();
      if (data && data.records && data.records.length > 0) liveRecords = data.records;
    } catch (e) { console.log("Data.gov Fail:", e.message); }
    let records = liveRecords;
    if (records.length === 0) {
      records = [
        { commodity: "Tomato", state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", min_price: 1500, max_price: 2200, modal_price: 1800, arrival_date: "03/09/2026", variety: "Deshi", grade: "FAQ" },
      ];
    }
    let formattedMandi = records.map(x => ({
      state: x.state || "", district: x.district || "", market: x.market || "", commodity: x.commodity || "",
      variety: x.variety || "General", grade: x.grade || "FAQ", arrivalDate: x.arrival_date || "Today",
      minPrice: Number(x.min_price || 0), maxPrice: Number(x.max_price || 0), modalPrice: Number(x.modal_price || 0)
    }));
    if (reqState) formattedMandi = formattedMandi.filter(x => x.state.toLowerCase().includes(reqState));
    if (reqCommodity) formattedMandi = formattedMandi.filter(x => x.commodity.toLowerCase().includes(reqCommodity));
    if (reqMarket) formattedMandi = formattedMandi.filter(x => x.market.toLowerCase().includes(reqMarket));
    return res.json({ ok: true, count: formattedMandi.length, mandi: formattedMandi, source: liveRecords.length > 0? "LIVE GOV" : "DEMO" });
  } catch (e) {
    return res.json({ ok: true, count: 1, mandi: [{ state: "UP", market: "Chandausi", commodity: "Tomato", minPrice: 1500, maxPrice: 2200, modalPrice: 1800 }], source: "Fallback" });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, key_present:!!process.env.GEMINI_API_KEY }));

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ reply: "API not found" });
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running on", PORT));

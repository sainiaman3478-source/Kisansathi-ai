import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - FIXED =====
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing - Render Environment me add karo");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me chota jawab do: ${prompt}` }] }],
      generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
    })
  });
  const data = await r.json();
  console.log("Gemini Response:", JSON.stringify(data).slice(0, 500)); // LOG
  if (!r.ok) throw new Error(data.error?.message || "Kisan AI Error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Koi jawab nahi mila";
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Chat hit:", req.body?.message);
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    console.error("CHAT ERROR:", e.message);
    // IMPORTANT: error ki jagah reply bhejo taaki frontend dikha sake
    res.json({ reply: `Error: ${e.message}. API Key check karo.` });
  }
});

// ===== CROP DOCTOR - FIXED MODEL =====
app.post("/api/crop-doctor", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error("GEMINI_API_KEY missing");
    const { image, mimeType, cropName, symptoms } = req.body;
    if (!image) return res.json({ reply: "Photo nahi mili." });

    const base64Data = image.includes(",")? image.split(",")[1] : image;
    const finalMime = mimeType || "image/jpeg";
    const promptText = `Tum expert Krishi Doctor ho. Fasal: ${cropName || 'Pata nahi'}, Lakshan: ${symptoms || 'Nahi'} - Hindi me bimari, dawa, bachav batao.`;

    // YAHAN FIX KIYA - 3.6 ki jagah 1.5
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }, { inline_data: { mime_type: finalMime, data: base64Data } }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.4 }
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini API error");
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.json({ reply: replyText || "Analyze nahi ho paya" });
  } catch (e) {
    console.error("Crop Doctor Error:", e.message);
    return res.json({ reply: `Crop Doctor Error: ${e.message}` });
  }
});

// ===== MANDI - UNTOUCHED =====
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
        { commodity: "Wheat", state: "Haryana", district: "Karnal", market: "Karnal", min_price: 2150, max_price: 2400, modal_price: 2250, arrival_date: "03/09/2026", variety: "Other", grade: "FAQ" }
      ];
    }
    let formattedMandi = records.map(x => ({
      state: x.state || "", district: x.district || "", market: x.market || "", commodity: x.commodity || "",
      variety: x.variety || "General", grade: x.grade || "FAQ", arrivalDate: x.arrival_date || x.date || "Today",
      minPrice: Number(x.min_price || x.min || 0), maxPrice: Number(x.max_price || x.max || 0), modalPrice: Number(x.modal_price || x.modal || 0)
    }));
    if (reqState) formattedMandi = formattedMandi.filter(x => x.state.toLowerCase().includes(reqState));
    if (reqCommodity) formattedMandi = formattedMandi.filter(x => x.commodity.toLowerCase().includes(reqCommodity));
    if (reqMarket) formattedMandi = formattedMandi.filter(x => x.market.toLowerCase().includes(reqMarket));
    return res.status(200).json({ ok: true, count: formattedMandi.length, mandi: formattedMandi, source: liveRecords.length > 0? "LIVE GOV" : "DEMO" });
  } catch (e) {
    return res.status(200).json({ ok: true, count: 1, mandi: [{ state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", commodity: "Tomato", variety: "Deshi", grade: "FAQ", arrivalDate: "Today", minPrice: 1500, maxPrice: 2200, modalPrice: 1800 }], source: "Fallback" });
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

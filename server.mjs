import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - UNTOUCHED =====
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me chota jawab do: ${prompt}` }] }],
      generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "Kisan AI Error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Koi jawab nahi mila";
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== CROP DOCTOR (FIXED TO GEMINI 3.6 FLASH) =====
app.post("/api/crop-doctor", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error("GEMINI_API_KEY missing");

    const { image, mimeType, cropName, symptoms } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Photo nahi mili." });
    }

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const finalMime = mimeType || "image/jpeg";

    const promptText = `Tum ek expert Krishi Doctor ho. Is photo aur details ko dekh kar Hindi me jawab do:
- Fasal ka naam: ${cropName || 'Pata nahi'}
- Kisaan dwara bataye gaye lakshan: ${symptoms || 'Koi nahi'}

Kripya niche diye gaye format me chota aur saral jawab do:
1. 🩺 **Bimari / Samasya:** (Bimari ka naam aur karan)
2. 💊 **Upchar / Dawa:** (Kaun si dawa ya kitnashak kitna dalna hai)
3. 🛡️ **Bachav ke Upay:** (Aage ke liye savdhani)`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: finalMime,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: { maxOutputTokens: 800, temperature: 0.4 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("Crop Doctor AI photo analyze nahi kar paya.");
    }

    return res.json({ reply: replyText });

  } catch (e) {
    console.error("Crop Doctor Error:", e.message);
    return res.status(500).json({ error: e.message || "Crop Doctor server me dikkat aayi." });
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
      if (data && data.records && data.records.length > 0) {
        liveRecords = data.records;
      }
    } catch (e) {
      console.log("Data.gov API Fetch Fail:", e.message);
    }

    let records = liveRecords;
    if (records.length === 0) {
      records = [
        { commodity: "Tomato", state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", min_price: 1500, max_price: 2200, modal_price: 1800, arrival_date: "03/09/2026", variety: "Deshi", grade: "FAQ" },
        { commodity: "Wheat", state: "Haryana", district: "Karnal", market: "Karnal", min_price: 2150, max_price: 2400, modal_price: 2250, arrival_date: "03/09/2026", variety: "Other", grade: "FAQ" },
        { commodity: "Potato", state: "Uttar Pradesh", district: "Sambhal", market: "Sambhal", min_price: 1000, max_price: 1600, modal_price: 1300, arrival_date: "03/09/2026", variety: "Deshi", grade: "FAQ" },
        { commodity: "Onion", state: "Maharashtra", district: "Nashik", market: "Lasalgaon", min_price: 1200, max_price: 1800, modal_price: 1500, arrival_date: "03/09/2026", variety: "Red", grade: "FAQ" },
        { commodity: "Mustard", state: "Rajasthan", district: "Jaipur", market: "Jaipur", min_price: 5200, max_price: 5800, modal_price: 5500, arrival_date: "03/09/2026", variety: "Mustard", grade: "FAQ" }
      ];
    }

    let formattedMandi = records.map(x => ({
      state: x.state || "",
      district: x.district || "",
      market: x.market || "",
      commodity: x.commodity || "",
      variety: x.variety || "General",
      grade: x.grade || "FAQ",
      arrivalDate: x.arrival_date || x.date || "Today",
      minPrice: Number(x.min_price || x.min || 0),
      maxPrice: Number(x.max_price || x.max || 0),
      modalPrice: Number(x.modal_price || x.modal || 0)
    }));

    if (reqState) {
      formattedMandi = formattedMandi.filter(x => x.state.toLowerCase().includes(reqState));
    }
    if (reqCommodity) {
      formattedMandi = formattedMandi.filter(x => x.commodity.toLowerCase().includes(reqCommodity));
    }
    if (reqMarket) {
      formattedMandi = formattedMandi.filter(x => x.market.toLowerCase().includes(reqMarket));
    }

    return res.status(200).json({
      ok: true,
      count: formattedMandi.length,
      mandi: formattedMandi,
      source: liveRecords.length > 0 ? "LIVE GOV" : "DEMO"
    });

  } catch (e) {
    return res.status(200).json({
      ok: true,
      count: 1,
      mandi: [{
        state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi",
        commodity: "Tomato", variety: "Deshi", grade: "FAQ", arrivalDate: "Today",
        minPrice: 1500, maxPrice: 2200, modalPrice: 1800
      }],
      source: "Fallback"
    });
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

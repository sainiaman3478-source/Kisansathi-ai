import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

async function callGemini(prompt, isImage = false, imageData = null) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.6-flash"];

  for (const MODEL of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Trying ${MODEL} attempt ${attempt}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
        let body;
        if (isImage) {
          body = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: imageData.mime, data: imageData.data } }] }], generationConfig: { maxOutputTokens: 800, temperature: 0.4 } };
        } else {
          body = { contents: [{ parts: [{ text: `Tum KisanSaathi AI ho, Hindi me chota jawab do: ${prompt}` }] }], generationConfig: { maxOutputTokens: 600, temperature: 0.5 } };
        }
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await r.json();
        if (r.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`Success with ${MODEL}`);
          return data.candidates[0].content.parts[0].text;
        }
        const errMsg = data.error?.message || "";
        console.log(`${MODEL} failed: ${errMsg.slice(0,120)}`);
        if (r.status === 503 || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded")) {
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        break;
      } catch (e) {
        console.log(`Catch ${MODEL}: ${e.message}`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }
  throw new Error("All models busy");
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    res.json({ reply: "AI thoda busy hai, 10 sec baad fir try karo." });
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
    return res.json({ reply: "Crop Doctor busy hai, thodi der baad try karo." });
  }
});

app.get("/api/mandi", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const reqState = (req.query.state || "").toLowerCase().trim();
    const reqCommodity = (req.query.commodity || "").toLowerCase().trim();
    let liveRecords = [];
    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&offset=0`;
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const data = await r.json();
      if (data?.records?.length > 0) liveRecords = data.records;
    } catch (e) {}
    let records = liveRecords.length? liveRecords : [{ commodity: "Tomato", state: "Uttar Pradesh", district: "Sambhal", market: "Chandausi", min_price: 1500, max_price: 2200, modal_price: 1800, arrival_date: "03/09/2026" }];
    let formattedMandi = records.map(x => ({ state: x.state || "", district: x.district || "", market: x.market || "", commodity: x.commodity || "", variety: x.variety || "General", grade: x.grade || "FAQ", arrivalDate: x.arrival_date || "Today", minPrice: Number(x.min_price || 0), maxPrice: Number(x.max_price || 0), modalPrice: Number(x.modal_price || 0) }));
    if (reqState) formattedMandi = formattedMandi.filter(x => x.state.toLowerCase().includes(reqState));
    if (reqCommodity) formattedMandi = formattedMandi.filter(x => x.commodity.toLowerCase().includes(reqCommodity));
    return res.json({ ok: true, count: formattedMandi.length, mandi: formattedMandi, source: liveRecords.length? "LIVE GOV" : "DEMO" });
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

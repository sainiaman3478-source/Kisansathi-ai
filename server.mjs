import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== KISAN AI - FINAL FIX FOR 3.6-FLASH HIGH DEMAND =====
async function callGemini(prompt, isImage = false, imageData = null) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const MODEL = "gemini-3.6-flash";

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Trying ${MODEL} attempt ${attempt}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

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

      if (r.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      const errMsg = data.error?.message || "";
      console.log(`Attempt ${attempt} failed: ${errMsg.slice(0, 150)}`);

      // 503 high demand hai to retry
      if (r.status === 503 || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("overloaded")) {
        if (attempt < 5) {
          await new Promise(res => setTimeout(res, 4000));
          continue;
        }
      }
      throw new Error(errMsg);

    } catch (e) {
      console.log(`Catch attempt ${attempt}: ${e.message}`);
      if (attempt < 5) {
        await new Promise(res => setTimeout(res, 4000));
        continue;
      }
      throw e;
    }
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Chat hit:", req.body?.message);
    const reply = await callGemini(req.body?.message || "hi");
    res.json({ reply });
  } catch (e) {
    console.error("CHAT ERROR:", e.message);
    res.json({ reply: `AI thoda busy hai, 10 sec baad fir se Namaste bhejo.` });
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
    return res.json({ reply: `Crop Doctor busy hai, 10 sec baad try karo.` });
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
      if (

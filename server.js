import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const openai = OPENAI_API_KEY? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const genAI = GEMINI_API_KEY? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ai_openai: Boolean(openai), ai_gemini: Boolean(genAI), mandi: Boolean(DATA_GOV_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "सवाल खाली है।" });

    const instructions = "You are KisanSaathi AI for Indian farmers. Reply in simple Hindi/Hinglish. Be practical and cautious. Never invent live weather or mandi prices. Ask for crop, crop age, location and symptoms when useful.";

    // 1. Try Gemini first (AQ. key)
    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `${instructions}\n\nUser: ${message}`,
        });
        return res.json({ reply: response.text || "AI से जवाब नहीं मिला।", source: "gemini" });
      } catch (e) {
        console.error("Gemini failed, trying OpenAI:", e.message);
      }
    }

    // 2. Fallback to OpenAI
    if (openai) {
      const r = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: instructions }, { role: "user", content: message }],
        max_tokens: 700
      });
      return res.json({ reply: r.choices[0]?.message?.content || "AI से जवाब नहीं मिला।", source: "openai" });
    }

    return res.status(503).json({ error: "AI key backend में सेट नहीं है। GEMINI_API_KEY या OPENAI_API_KEY डालें।" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI service error: " + e.message });
  }
});

// Mandi wala code same rahega...
const aliases = { "गेहूं": "Wheat", "गेंहू": "Wheat", "धान": "Rice", "चावल": "Rice", "सरसों": "Mustard", "मक्का": "Maize", "मकई": "Maize", "कपास": "Cotton", "सोयाबीन": "Soyabean", "सोया": "Soyabean", "प्याज": "Onion", "टमाटर": "Tomato", "आलू": "Potato", "चना": "Gram", "अरहर": "Arhar (Tur/Red Gram)", "बाजरा": "Bajra (Pearl Millet/Cumbu)", "जौ": "Barley", "मूंग": "Green Gram (Moong)(Whole)", "उड़द": "Black Gram (Urd Beans)(Whole)" };
app.get("/api/mandi", async (req, res) => {
  try {
    if (!DATA_GOV_API_KEY) return res.status(503).json({ error: "DATA_GOV_API_KEY backend में सेट नहीं है।" });
    const raw = String(req.query.crop || "").trim();
    const crop = aliases[raw.toLowerCase()] || raw;
    const p = new URLSearchParams({ "api-key": DATA_GOV_API_KEY, format: "json", limit: "100", offset: "0" });
    if (crop) p.set("filters[commodity]", crop);
    p.set("sort[arrival_date]", "desc");
    const r = await fetch(`https://api.data.gov.in/resource/${RESOURCE}?${p.toString()}`);
    if (!r.ok) throw new Error(`data.gov.in ${r.status}`);
    const body = await r.json();
    const records = Array.isArray(body.records)? body.records : [];
    const data = records.map(x => ({ state: x.state || "", district: x.district || "", market: x.market || "", commodity: x.commodity || "", variety: x.variety || "", grade: x.grade || "", min_price: Number(x.min_price) || 0, max_price: Number(x.max_price) || 0, modal_price: Number(x.modal_price) || 0, arrival_date: x.arrival_date || "" })).filter(x => x.modal_price > 0);
    res.json({ data, count: data.length, source: "data.gov.in / AGMARKNET" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "सरकारी मंडी डेटा नहीं मिल पाया।" });
  }
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
app.listen(PORT, () => { console.log(`KisanSaathi backend running on port ${PORT}`); });

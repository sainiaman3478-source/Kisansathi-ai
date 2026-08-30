import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai: Boolean(openai),
    mandi: Boolean(DATA_GOV_API_KEY)
  });
});

/* =========================
   AI CHAT
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली है।"
      });
    }

    if (!openai) {
      return res.status(503).json({
        error: "OPENAI_API_KEY backend .env में सेट नहीं है।"
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions: `
You are KisanSaathi AI for Indian farmers.

Reply in simple Hindi/Hinglish.

Be practical, clear and cautious.

Never invent live weather information or live mandi prices.

When useful, ask for:
- crop
- crop age
- location
- symptoms

For pesticides and fertilizers:
Do not give unsafe exact dosage without product label
and necessary context.

For serious crop disease, recommend confirmation
from a local agriculture expert.

Keep answers useful and easy for farmers to understand.
`,

      input: message,

      max_output_tokens: 700
    });

    return res.json({
      reply: response.output_text || "AI से जवाब नहीं मिला।"
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      error: "AI service error. Backend logs देखें।"
    });
  }
});

/* =========================
   CROP ALIASES
========================= */

const aliases = {
  "गेहूं": "Wheat",
  "गेंहू": "Wheat",
  "धान": "Rice",
  "चावल": "Rice",
  "सरसों": "Mustard",
  "मक्का": "Maize",
  "मकई": "Maize",
  "कपास": "Cotton",
  "सोयाबीन": "Soyabean",
  "सोया": "Soyabean",
  "प्याज": "Onion",
  "टमाटर": "Tomato",
  "आलू": "Potato",
  "चना": "Gram",
  "अरहर": "Arhar (Tur/Red Gram)",
  "बाजरा": "Bajra (Pearl Millet/Cumbu)",
  "जौ": "Barley",
  "मूंग": "Green Gram (Moong)(Whole)",
  "उड़द": "Black Gram (Urd Beans)(Whole)"
};

/* =========================
   MANDI API
========================= */

app.get("/api/mandi", async (req, res) => {
  try {
    if (!DATA_GOV_API_KEY) {
      return res.status(503).json({
        error: "DATA_GOV_API_KEY backend .env में सेट नहीं है।"
      });
    }

    const raw = String(req.query.crop || "").trim();

    const crop =
      aliases[raw.toLowerCase()] || raw;

    const params = new URLSearchParams({
      "api-key": DATA_GOV_API_KEY,
      format: "json",
      limit: "100",
      offset: "0"
    });

    if (crop) {
      params.set("filters[commodity]", crop);
    }

    params.set("sort[arrival_date]", "desc");

    const url =
      `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `data.gov.in HTTP ${response.status}`
      );
    }

    const body = await response.json();

    const records = Array.isArray(body.records)
      ? body.records
      : [];

    const data = records
      .map((x) => ({
        state: x.state || "",
        district: x.district || "",
        market: x.market || "",
        commodity: x.commodity || "",
        variety: x.variety || "",
        grade: x.grade || "",

        min_price: Number(x.min_price) || 0,
        max_price: Number(x.max_price) || 0,
        modal_price: Number(x.modal_price) || 0,

        arrival_date: x.arrival_date || ""
      }))
      .filter((x) => x.modal_price > 0);

    return res.json({
      data,
      count: data.length,
      source: "data.gov.in / AGMARKNET"
    });

  } catch (error) {
    console.error("MANDI ERROR:", error);

    return res.status(500).json({
      error:
        "सरकारी मंडी डेटा नहीं मिल पाया। API key या data.gov.in connection जांचें।"
    });
  }
});

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    name: "KisanSaathi AI Backend",
    status: "running",
    endpoints: [
      "/api/health",
      "/api/chat",
      "/api/mandi"
    ]
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `KisanSaathi backend running on port ${PORT}`
  );
});

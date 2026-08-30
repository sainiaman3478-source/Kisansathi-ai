import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY
    })
  : null;

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai: Boolean(openai),
    mandi: Boolean(DATA_GOV_API_KEY),
    message: "KisanSaathi backend running"
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
        error: "OPENAI_API_KEY backend में सेट नहीं है।"
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions: `
आप KisanSaathi AI हैं — भारतीय किसानों के डिजिटल साथी।

हमेशा सरल हिंदी या Hinglish में जवाब दें।

किसान के सवाल का सीधा और उपयोगी जवाब दें।

अगर फसल की बीमारी या समस्या पूछी जाए तो:
- फसल का नाम पूछें
- फसल की उम्र पूछें
- किसान का राज्य/जिला पूछें
- लक्षण पूछें
- जरूरत हो तो फोटो भेजने को कहें

दवा या कीटनाशक के मामले में:
- बिना पर्याप्त जानकारी के गलत या खतरनाक मात्रा न बताएं
- हमेशा product label और स्थानीय कृषि विशेषज्ञ की सलाह का ध्यान रखने को कहें

मंडी भाव के मामले में:
- खुद से आज का भाव न बनाएं
- केवल उपलब्ध सरकारी मंडी डेटा का उपयोग करें

मौसम के मामले में:
- live weather उपलब्ध न हो तो अनुमान लगाकर मौसम न बताएं

जवाब किसान के लिए आसान, छोटा और practical रखें।
`,

      input: message,

      max_output_tokens: 700
    });

    const reply =
      response.output_text?.trim() ||
      "माफ कीजिए, अभी AI से जवाब नहीं मिल पाया।";

    return res.json({
      reply
    });

  } catch (error) {

    console.error("OPENAI ERROR:", error);

    return res.status(500).json({
      error: "AI से जवाब लेने में समस्या हुई।",
      details: error?.message || "Unknown error"
    });
  }
});

/* =========================
   MANDI DATA
========================= */

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

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

app.get("/api/mandi", async (req, res) => {
  try {

    if (!DATA_GOV_API_KEY) {
      return res.status(503).json({
        error: "DATA_GOV_API_KEY backend में सेट नहीं है।"
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
      params.set(
        "filters[commodity]",
        crop
      );
    }

    params.set(
      "sort[arrival_date]",
      "desc"
    );

    const response = await fetch(
      `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `data.gov.in HTTP ${response.status}`
      );
    }

    const body = await response.json();

    const records =
      Array.isArray(body.records)
        ? body.records
        : [];

    const data = records
      .map(item => ({
        state: item.state || "",
        district: item.district || "",
        market: item.market || "",
        commodity: item.commodity || "",
        variety: item.variety || "",
        grade: item.grade || "",

        min_price:
          Number(item.min_price) || 0,

        max_price:
          Number(item.max_price) || 0,

        modal_price:
          Number(item.modal_price) || 0,

        arrival_date:
          item.arrival_date || ""
      }))
      .filter(item =>
        item.modal_price > 0
      );

    return res.json({
      data,
      count: data.length,
      source: "data.gov.in / AGMARKNET"
    });

  } catch (error) {

    console.error(
      "MANDI ERROR:",
      error
    );

    return res.status(500).json({
      error:
        "सरकारी मंडी डेटा नहीं मिल पाया।"
    });
  }
});

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    app: "KisanSaathi AI",
    status: "online",
    ai: Boolean(openai),
    mandi: Boolean(DATA_GOV_API_KEY)
  });
});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `KisanSaathi backend running on port ${PORT}`
  );
});

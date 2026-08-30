import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

/* =========================
   FREE KISAN AI
   OpenAI credits की जरूरत नहीं
========================= */

function freeAiReply(message) {
  const q = String(message || "").trim().toLowerCase();

  if (!q) {
    return "कृपया अपना खेती से जुड़ा सवाल लिखें।";
  }

  if (
    (q.includes("गेहूं") || q.includes("गेंहू")) &&
    (q.includes("पीली") ||
      q.includes("पीला") ||
      q.includes("पत्ती") ||
      q.includes("पत्ते"))
  ) {
    return "🌾 गेहूं की पत्तियां पीली होने के कई कारण हो सकते हैं—नाइट्रोजन की कमी, ज्यादा पानी, जड़ों की समस्या या रोग। पहले खेत की नमी देखें। सही सलाह के लिए फसल की उम्र, राज्य/जिला और पत्ती की फोटो भेजें।";
  }

  if (
    (q.includes("गेहूं") || q.includes("गेंहू")) &&
    (q.includes("खाद") || q.includes("उर्वरक"))
  ) {
    return "🌾 गेहूं में खाद की सही मात्रा मिट्टी की जांच और फसल की अवस्था पर निर्भर करती है। नाइट्रोजन की बची मात्रा अक्सर सिंचाई के आसपास दी जाती है, लेकिन बिना खेत की जानकारी के निश्चित मात्रा बताना सही नहीं होगा। फसल की उम्र और आखिरी सिंचाई बताएं।";
  }

  if (
    (q.includes("धान") || q.includes("चावल")) &&
    (q.includes("पीली") ||
      q.includes("पीला") ||
      q.includes("पत्ती") ||
      q.includes("पत्ते"))
  ) {
    return "🌾 धान की पत्तियां पीली होने पर पानी का स्तर, नाइट्रोजन की कमी और कीट/रोग देखें। खेत में बहुत ज्यादा पानी हो तो निकासी रखें। पत्ती पर धब्बे या कीड़े दिखें तो फोटो भेजें और फसल की उम्र बताएं।";
  }

  if (
    (q.includes("धान") || q.includes("चावल")) &&
    (q.includes("खाद") || q.includes("उर्वरक"))
  ) {
    return "🌾 धान में खाद की मात्रा किस्म, मिट्टी और फसल की अवस्था पर निर्भर करती है। ज्यादा यूरिया एक साथ न डालें। फसल की उम्र और पिछली खाद की जानकारी दें।";
  }

  if (
    q.includes("सरसों") &&
    (q.includes("कीड़ा") ||
      q.includes("कीट") ||
      q.includes("माहू"))
  ) {
    return "🌱 सरसों में माहू/कीट दिखने पर पहले पत्तियों और फूलों के नीचे जांच करें। स्थानीय कृषि विभाग की अनुशंसित दवा और उसके लेबल के अनुसार ही उपयोग करें। बिना पहचान के दवा न डालें। फोटो भेजें तो पहचान में मदद कर सकता हूं।";
  }

  if (
    (q.includes("मक्का") || q.includes("मकई")) &&
    (q.includes("पीली") ||
      q.includes("पीला") ||
      q.includes("पत्ती"))
  ) {
    return "🌽 मक्का की पत्तियां पीली होने पर नाइट्रोजन की कमी, जलभराव या जड़ की समस्या देखें। खेत में पानी खड़ा है तो निकासी करें। फसल की उम्र और पत्ती की फोटो भेजें।";
  }

  if (
    q.includes("कपास") &&
    (q.includes("कीड़ा") ||
      q.includes("कीट") ||
      q.includes("इल्ली"))
  ) {
    return "🌱 कपास में पहले कीट की पहचान करें। पत्तियों, फूलों और टिंडों को ध्यान से देखें। स्थानीय कृषि विशेषज्ञ की अनुशंसा और दवा के लेबल के अनुसार ही छिड़काव करें। फोटो और फसल की उम्र भेजें।";
  }

  if (
    q.includes("सिंचाई") ||
    q.includes("पानी कब") ||
    q.includes("पानी कितनी बार")
  ) {
    return "💧 सिंचाई का समय फसल, मिट्टी, मौसम और फसल की अवस्था पर निर्भर करता है। खेत में पानी खड़ा न रहने दें। फसल का नाम, उम्र और मिट्टी बताएं।";
  }

  if (
    q.includes("बारिश") ||
    q.includes("वर्षा")
  ) {
    return "🌧️ बारिश की सही जानकारी के लिए KisanSaathi के मौसम पेज पर Location अनुमति देकर live forecast देखें। बिना live मौसम डेटा के मैं बारिश का अनुमान नहीं लगाऊंगा।";
  }

  if (
    q.includes("मंडी") ||
    q.includes("भाव") ||
    q.includes("रेट") ||
    q.includes("कीमत")
  ) {
    return "📊 आज का मंडी भाव अनुमान से नहीं बताना चाहिए। KisanSaathi के मंडी सेक्शन में फसल चुनकर सरकारी data.gov.in/AGMARKNET डेटा देखें। फसल का नाम बताएं तो मैं तरीका बता सकता हूं।";
  }

  if (
    q.includes("यूरिया") ||
    q.includes("डीएपी") ||
    q.includes("dap") ||
    q.includes("एनपीके") ||
    q.includes("npk") ||
    q.includes("खाद")
  ) {
    return "🌱 खाद की सही मात्रा फसल, मिट्टी की जांच और फसल की अवस्था पर निर्भर करती है। बिना जानकारी के ज्यादा खाद न डालें। फसल का नाम, उम्र, राज्य/जिला और पिछली खाद बताएं।";
  }

  if (
    q.includes("रोग") ||
    q.includes("बीमारी") ||
    q.includes("कीड़ा") ||
    q.includes("कीट") ||
    q.includes("इल्ली") ||
    q.includes("दाग") ||
    q.includes("धब्बा")
  ) {
    return "🔎 पहले समस्या की पहचान जरूरी है। फसल का नाम, उम्र, राज्य/जिला, लक्षण कब से हैं और पत्ती/तने/फल पर क्या दिख रहा है बताएं। साफ फोटो भेजें तो मदद मिलेगी।";
  }

  return "🤖 मैं KisanSaathi का free किसान सहायक हूं। फसल का नाम, उम्र और समस्या बताएं। उदाहरण: “गेहूं की पत्तियां पीली हो रही हैं, क्या करूं?”";
}


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai: true,
    aiMode: "free-local",
    mandi: Boolean(DATA_GOV_API_KEY),
    message: "KisanSaathi free AI backend running"
  });
});


/* =========================
   AI CHAT
========================= */

app.post("/api/chat", (req, res) => {
  try {
    const message = String(
      req.body?.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली है।"
      });
    }

    const reply = freeAiReply(message);

    return res.json({
      reply,
      mode: "free-local"
    });

  } catch (error) {
    console.error(
      "FREE AI ERROR:",
      error
    );

    return res.status(500).json({
      error: "AI से जवाब देने में समस्या हुई।"
    });
  }
});


/* =========================
   MANDI DATA
========================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

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
        error:
          "DATA_GOV_API_KEY backend में सेट नहीं है।"
      });
    }

    const raw = String(
      req.query.crop || ""
    ).trim();

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

    const body =
      await response.json();

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
      source:
        "data.gov.in / AGMARKNET"
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
    ai: true,
    aiMode: "free-local",
    mandi: Boolean(DATA_GOV_API_KEY)
  });
});


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `KisanSaathi free AI backend running on port ${PORT}`
    );
  }
);

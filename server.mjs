import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Government of India Data.gov.in API key
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

// Current Daily Price of Various Commodities from Various Markets
const MANDI_RESOURCE_ID =
  "9ef84268-d588-465a-a308-a864a43d0070";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* =========================
   HOME / HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    app: "KisanSaathi AI",
    message: "KisanSaathi AI backend is running 🌾"
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "KisanSaathi AI API"
  });
});

/* =========================
   REAL MANDI BHAV
   GOVERNMENT DATA.GOV.IN
========================= */

app.get("/api/mandi", async (req, res) => {
  try {
    if (!DATA_GOV_API_KEY) {
      return res.status(500).json({
        ok: false,
        error:
          "DATA_GOV_API_KEY server में सेट नहीं है।"
      });
    }

    const state =
      typeof req.query.state === "string"
        ? req.query.state.trim()
        : "";

    const commodity =
      typeof req.query.commodity === "string"
        ? req.query.commodity.trim()
        : "";

    const market =
      typeof req.query.market === "string"
        ? req.query.market.trim()
        : "";

    const limitRaw = Number(req.query.limit || 50);

    const limit =
      Number.isFinite(limitRaw)
        ? Math.min(Math.max(Math.floor(limitRaw), 1), 100)
        : 50;

    const params = new URLSearchParams();

    params.set("api-key", DATA_GOV_API_KEY);
    params.set("format", "json");
    params.set("limit", String(limit));

    /*
      Optional filters.

      Data.gov.in supports filters using
      field=value format.
    */

    if (state) {
      params.set("filters[State]", state);
    }

    if (commodity) {
      params.set("filters[Commodity]", commodity);
    }

    if (market) {
      params.set("filters[Market]", market);
    }

    const url =
      `https://api.data.gov.in/resource/${MANDI_RESOURCE_ID}?${params.toString()}`;

    console.log(
      "🌾 Mandi API request:",
      {
        state,
        commodity,
        market,
        limit
      }
    );

    const response = await fetch(url);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "Data.gov.in Mandi API Error:",
        data
      );

      return res.status(response.status).json({
        ok: false,
        error:
          data?.error ||
          data?.message ||
          "Government Mandi API से data नहीं मिला।"
      });
    }

    const records =
      Array.isArray(data.records)
        ? data.records
        : [];

    /*
      Frontend के लिए साफ और आसान format
    */

    const mandi = records.map((item) => ({
      state: item.State || "",
      district: item.District || "",
      market: item.Market || "",
      commodity: item.Commodity || "",
      variety: item.Variety || "",
      grade: item.Grade || "",
      arrivalDate:
        item.Arrival_Date ||
        item["Arrival Date"] ||
        "",
      minPrice: Number(
        item.Min_Price || 0
      ),
      maxPrice: Number(
        item.Max_Price || 0
      ),
      modalPrice: Number(
        item.Modal_Price || 0
      )
    }));

    return res.json({
      ok: true,
      source: "Government of India - Data.gov.in / AGMARKNET",
      count: mandi.length,
      mandi
    });
  } catch (error) {
    console.error(
      "Real Mandi server error:",
      error
    );

    return res.status(500).json({
      ok: false,
      error:
        "Real Mandi Bhav service से connection नहीं हो पाया।"
    });
  }
});

/* =========================
   AI CHAT
   इसे जानबूझकर नहीं बदला गया
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const message =
      typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली है।"
      });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error:
          "OPENAI_API_KEY अभी server में सेट नहीं है।"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5-mini",

          instructions: `
तुम KisanSaathi AI हो।

तुम भारतीय किसानों के लिए सरल और उपयोगी
हिंदी में जवाब देते हो।

तुम इन विषयों में मदद कर सकते हो:
- फसल
- खेती
- खाद
- सिंचाई
- कीट
- फसल रोग
- मौसम
- मंडी
- सरकारी कृषि योजनाएं
- खेती की सामान्य जानकारी

नियम:
1. जवाब सरल हिंदी में दो।
2. किसान को practical steps बताओ।
3. बिना पक्की जानकारी के दवा की मात्रा या खतरनाक chemical dosage मत बताओ।
4. बीमारी की पहचान केवल फोटो/लक्षण से निश्चित न बताओ।
5. जरूरत होने पर कृषि विशेषज्ञ/KVK/स्थानीय अधिकारी से पुष्टि करने को कहो।
6. मौसम और मंडी के बारे में live data होने का दावा मत करो जब तक data उपलब्ध न हो।
7. जवाब छोटा, साफ और किसान के काम का रखो।
          `,

          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenAI API Error:",
        data
      );

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "AI service से जवाब नहीं मिला।"
      });
    }

    let reply = "";

    if (typeof data.output_text === "string") {
      reply = data.output_text;
    }

    if (!reply && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item.content)) {
          continue;
        }

        for (const content of item.content) {
          if (
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {
            reply += content.text;
          }
        }
      }
    }

    reply = reply.trim();

    if (!reply) {
      reply =
        "AI से इस समय जवाब नहीं मिला। कृपया दोबारा कोशिश करें।";
    }

    return res.json({
      ok: true,
      reply
    });
  } catch (error) {
    console.error(
      "Server error:",
      error
    );

    return res.status(500).json({
      error:
        "AI सेवा से कनेक्शन नहीं हो पाया।"
    });
  }
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    error: "API route नहीं मिला।"
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🌾 KisanSaathi AI server running on port ${PORT}`
  );
});

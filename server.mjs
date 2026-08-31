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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const KISAN_SYSTEM_INSTRUCTION = `
You are KisanSaathi AI, a helpful farming assistant for Indian farmers.

Reply in simple Hindi or easy Hinglish.
Be practical, clear and concise.

For crop problems, ask for:
- crop name
- crop age
- state/district
- symptoms

when needed.

For fertilizer or pesticide advice, do not invent unsafe exact doses.
Follow the product label and local agriculture expert when exact dosage
depends on product, crop or region.

Never invent live mandi prices or live weather.

If the user asks for live mandi/weather, tell them to use the app's
live mandi/weather sections.

Do not claim you saw a crop photo unless an image was actually provided
to the API.
`;

async function geminiReply(message) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY backend में सेट नहीं है।");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: KISAN_SYSTEM_INSTRUCTION }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 700
      }
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("GEMINI API ERROR:", response.status, body);

    throw new Error(
      body?.error?.message ||
      `Gemini API HTTP ${response.status}`
    );
  }

  const reply =
    body?.candidates?.[0]?.content?.parts
      ?.map(part => part?.text || "")
      .join("")
      .trim();

  if (!reply) {
    throw new Error("Gemini ने कोई जवाब नहीं दिया।");
  }

  return reply;
}


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai: Boolean(GEMINI_API_KEY),
    aiMode: GEMINI_API_KEY ? "gemini" : "not-configured",
    geminiModel: GEMINI_MODEL,
    mandi: Boolean(DATA_GOV_API_KEY),
    message: "KisanSaathi AI backend running"
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

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY Render Environment में सेट नहीं है।"
      });
    }

    const reply = await geminiReply(message);

    return res.json({
      reply,
      mode: "gemini"
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? `Gemini AI error: ${error.message}`
          : "Gemini AI से जवाब नहीं मिला।"
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
  "wheat": "Wheat",

  "धान": "Rice",
  "चावल": "Rice",
  "rice": "Rice",

  "सरसों": "Mustard",
  "mustard": "Mustard",

  "मक्का": "Maize",
  "मकई": "Maize",
  "maize": "Maize",

  "कपास": "Cotton",
  "cotton": "Cotton",

  "सोयाबीन": "Soyabean",
  "सोया": "Soyabean",
  "soyabean": "Soyabean",
  "soybean": "Soyabean",

  "प्याज": "Onion",
  "onion": "Onion",

  "टमाटर": "Tomato",
  "tomato": "Tomato",

  "आलू": "Potato",
  "potato": "Potato",

  "चना": "Gram",
  "gram": "Gram",

  "अरहर": "Arhar (Tur/Red Gram)",

  "बाजरा": "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",
  "barley": "Barley",

  "मूंग": "Green Gram (Moong)(Whole)",

  "उड़द": "Black Gram (Urd Beans)(Whole)"
};


/* =========================
   NORMALIZE TEXT
========================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}


/* =========================
   FETCH MANDI RECORDS
========================= */

async function fetchMandiPage({
  crop = "",
  limit = 1000,
  offset = 0,
  useFilter = true
}) {
  const params = new URLSearchParams({
    "api-key": DATA_GOV_API_KEY,
    format: "json",
    limit: String(limit),
    offset: String(offset)
  });

  if (useFilter && crop) {
    params.set("filters[commodity]", crop);
  }

  params.set("sort[arrival_date]", "desc");

  const url =
    `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`;

  console.log("MANDI REQUEST:", url.replace(DATA_GOV_API_KEY, "***"));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `data.gov.in HTTP ${response.status}`
    );
  }

  const body = await response.json();

  return Array.isArray(body.records)
    ? body.records
    : [];
}


/* =========================
   FORMAT RECORDS
========================= */

function formatMandiRecords(records) {
  return records
    .map(item => ({
      state: item.state || "",
      district: item.district || "",
      market: item.market || "",
      commodity: item.commodity || "",
      variety: item.variety || "",
      grade: item.grade || "",

      min_price: Number(item.min_price) || 0,
      max_price: Number(item.max_price) || 0,
      modal_price: Number(item.modal_price) || 0,

      arrival_date: item.arrival_date || ""
    }))
    .filter(item => item.modal_price > 0);
}


/* =========================
   MANDI API
========================= */

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
      aliases[normalizeText(raw)] || raw;

    console.log("MANDI RAW CROP:", raw);
    console.log("MANDI NORMALIZED CROP:", crop);


    /*
      STEP 1
      Exact government API filter
    */

    let exactRecords = [];

    if (crop) {
      exactRecords = await fetchMandiPage({
        crop,
        limit: 1000,
        offset: 0,
        useFilter: true
      });
    }

    console.log(
      "MANDI EXACT RESULTS:",
      exactRecords.length
    );


    /*
      STEP 2
      If exact result is zero,
      fetch without commodity filter.
    */

    let finalRecords = exactRecords;

    if (
      crop &&
      exactRecords.length === 0
    ) {

      console.log(
        "MANDI FALLBACK: exact commodity returned 0"
      );

      const fallbackRecords =
        await fetchMandiPage({
          crop: "",
          limit: 1000,
          offset: 0,
          useFilter: false
        });

      console.log(
        "MANDI FALLBACK RECORDS:",
        fallbackRecords.length
      );


      /*
        STEP 3
        Local fuzzy commodity matching
      */

      const wanted = normalizeText(crop);

      finalRecords =
        fallbackRecords.filter(item => {

          const commodity =
            normalizeText(item.commodity);

          return (
            commodity === wanted ||
            commodity.includes(wanted) ||
            wanted.includes(commodity)
          );

        });


      /*
        Some government commodity names
        can be different from our alias.
      */

      if (finalRecords.length === 0) {

        const rawWanted =
          normalizeText(raw);

        finalRecords =
          fallbackRecords.filter(item => {

            const commodity =
              normalizeText(item.commodity);

            return (
              commodity.includes(rawWanted) ||
              rawWanted.includes(commodity)
            );

          });
      }


      console.log(
        "MANDI LOCAL MATCH RESULTS:",
        finalRecords.length
      );
    }


    /*
      STEP 4
      If no crop was selected,
      return all current records.
    */

    if (!crop) {

      finalRecords =
        await fetchMandiPage({
          crop: "",
          limit: 1000,
          offset: 0,
          useFilter: false
        });

      console.log(
        "MANDI ALL RECORDS:",
        finalRecords.length
      );
    }


    const data =
      formatMandiRecords(finalRecords);


    console.log(
      "MANDI FINAL DATA:",
      data.length
    );


    return res.json({
      data,
      count: data.length,
      crop: crop || null,
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
    ai: Boolean(GEMINI_API_KEY),
    aiMode: GEMINI_API_KEY
      ? "gemini"
      : "not-configured",
    mandi: Boolean(DATA_GOV_API_KEY),
    geminiModel: GEMINI_MODEL
  });
});


/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `KisanSaathi AI backend running on port ${PORT} | Gemini: ${Boolean(
      GEMINI_API_KEY
    )} | Model: ${GEMINI_MODEL}`
  );

});

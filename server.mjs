import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

/* =========================================================
   KISANSAATHI AI
========================================================= */

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

/* =========================================================
   GEMINI
========================================================= */

async function geminiReply(message) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY backend में सेट नहीं है।"
    );
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(GEMINI_MODEL)}:generateContent`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },

    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: KISAN_SYSTEM_INSTRUCTION,
          },
        ],
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],

      generationConfig: {
        maxOutputTokens: 700,
      },
    }),
  });

  const body =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(
      "GEMINI API ERROR:",
      response.status,
      body
    );

    throw new Error(
      body?.error?.message ||
        `Gemini API HTTP ${response.status}`
    );
  }

  const reply =
    body?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

  if (!reply) {
    throw new Error(
      "Gemini ने कोई जवाब नहीं दिया।"
    );
  }

  return reply;
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,

    ai: Boolean(GEMINI_API_KEY),

    aiMode: GEMINI_API_KEY
      ? "gemini"
      : "not-configured",

    geminiModel: GEMINI_MODEL,

    mandi: Boolean(DATA_GOV_API_KEY),

    message:
      "KisanSaathi AI backend running",
  });
});

/* =========================================================
   AI CHAT
========================================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(
      req.body?.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली है।",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY Render Environment में सेट नहीं है।",
      });
    }

    const reply = await geminiReply(message);

    return res.json({
      reply,
      mode: "gemini",
    });
  } catch (error) {
    console.error(
      "CHAT ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? `Gemini AI error: ${error.message}`
          : "Gemini AI से जवाब नहीं मिला।",
    });
  }
});

/* =========================================================
   REAL GOVERNMENT MANDI DATA
========================================================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

/* =========================================================
   HINDI / ENGLISH COMMODITY ALIASES
========================================================= */

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

  "अरहर":
    "Arhar (Tur/Red Gram)",

  "बाजरा":
    "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",
  "barley": "Barley",

  "मूंग":
    "Green Gram (Moong)(Whole)",

  "उड़द":
    "Black Gram (Urd Beans)(Whole)",
};

/* =========================================================
   NORMALIZE TEXT
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/* =========================================================
   GET GOVERNMENT DATA
========================================================= */

async function fetchMandiData({
  state = "",
  commodity = "",
  market = "",
}) {
  const params = new URLSearchParams();

  params.set(
    "api-key",
    DATA_GOV_API_KEY
  );

  params.set(
    "format",
    "json"
  );

  params.set(
    "limit",
    "1000"
  );

  params.set(
    "offset",
    "0"
  );

  /*
   IMPORTANT FIX:
   Government API में state filter
   filters[state.keyword] होना चाहिए।
  */

  if (state) {
    params.set(
      "filters[state.keyword]",
      state
    );
  }

  if (commodity) {
    params.set(
      "filters[commodity]",
      commodity
    );
  }

  /*
   Market को Government API में exact filter
   नहीं भेज रहे हैं।

   क्योंकि Azadpur जैसे market names में
   spelling / suffix / formatting अलग हो सकती है।

   Market को नीचे local filtering से खोजेंगे।
  */

  const url =
    `https://api.data.gov.in/resource/${RESOURCE}?` +
    params.toString();

  console.log(
    "MANDI REQUEST:",
    url.replace(
      DATA_GOV_API_KEY,
      "HIDDEN_KEY"
    )
  );

  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        Accept:
          "application/json",
      },
    }
  );

  const body =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    console.error(
      "DATA.GOV ERROR:",
      response.status,
      body
    );

    throw new Error(
      body?.error ||
        body?.message ||
        `data.gov.in HTTP ${response.status}`
    );
  }

  return body;
}

/* =========================================================
   NORMALIZE GOVERNMENT RECORDS
========================================================= */

function normalizeRecords(records) {
  return records
    .map((item) => ({
      state:
        item.state || "",

      district:
        item.district || "",

      market:
        item.market || "",

      commodity:
        item.commodity || "",

      variety:
        item.variety || "",

      grade:
        item.grade || "",

      arrivalDate:
        item.arrival_date || "",

      minPrice:
        Number(
          item.min_price
        ) || 0,

      maxPrice:
        Number(
          item.max_price
        ) || 0,

      modalPrice:
        Number(
          item.modal_price
        ) || 0,
    }))
    .filter(
      (item) =>
        item.modalPrice > 0
    );
}

/* =========================================================
   REAL GOVERNMENT MANDI API
========================================================= */

app.get("/api/mandi", async (req, res) => {
  try {
    if (!DATA_GOV_API_KEY) {
      return res.status(503).json({
        ok: false,

        error:
          "DATA_GOV_API_KEY backend में सेट नहीं है। Render Environment में key डालें।",
      });
    }

    /* -------------------------------------------------------
       FRONTEND INPUT
    ------------------------------------------------------- */

    const rawState = String(
      req.query.state || ""
    ).trim();

    const rawCommodity = String(
      req.query.commodity ||
        req.query.crop ||
        ""
    ).trim();

    const rawMarket = String(
      req.query.market || ""
    ).trim();

    /*
     Hindi commodity को Government
     commodity name में बदलना
    */

    const commodity =
      aliases[
        rawCommodity.toLowerCase()
      ] || rawCommodity;

    console.log(
      "MANDI SEARCH:",
      {
        state: rawState,
        commodity,
        market: rawMarket,
      }
    );

    /* -------------------------------------------------------
       FIRST REQUEST
       State + Commodity
    ------------------------------------------------------- */

    let body =
      await fetchMandiData({
        state: rawState,
        commodity,
      });

    let records =
      Array.isArray(body.records)
        ? body.records
        : [];

    let data =
      normalizeRecords(records);

    /* -------------------------------------------------------
       LOCAL FILTER
    ------------------------------------------------------- */

    const stateSearch =
      cleanText(rawState);

    const marketSearch =
      cleanText(rawMarket);

    const commoditySearch =
      cleanText(commodity);

    let filteredData =
      data.filter((item) => {
        const stateText =
          cleanText(item.state);

        const marketText =
          cleanText(item.market);

        const commodityText =
          cleanText(item.commodity);

        const stateOK =
          !stateSearch ||
          stateText.includes(
            stateSearch
          );

        const marketOK =
          !marketSearch ||
          marketText.includes(
            marketSearch
          );

        const commodityOK =
          !commoditySearch ||
          commodityText.includes(
            commoditySearch
          );

        return (
          stateOK &&
          marketOK &&
          commodityOK
        );
      });

    /* -------------------------------------------------------
       FALLBACK SEARCH

       अगर State + Commodity से result नहीं मिला,
       तो State के records लेकर local search करेंगे।
    ------------------------------------------------------- */

    if (
      filteredData.length === 0 &&
      rawMarket
    ) {
      console.log(
        "MANDI FALLBACK: state + market"
      );

      body =
        await fetchMandiData({
          state: rawState,
          commodity: "",
        });

      records =
        Array.isArray(body.records)
          ? body.records
          : [];

      data =
        normalizeRecords(records);

      filteredData =
        data.filter((item) => {
          const stateText =
            cleanText(item.state);

          const marketText =
            cleanText(item.market);

          const commodityText =
            cleanText(item.commodity);

          const stateOK =
            !stateSearch ||
            stateText.includes(
              stateSearch
            );

          const marketOK =
            marketText.includes(
              marketSearch
            );

          const commodityOK =
            !commoditySearch ||
            commodityText.includes(
              commoditySearch
            );

          return (
            stateOK &&
            marketOK &&
            commodityOK
          );
        });
    }

    /* -------------------------------------------------------
       SORT
       Latest arrival date first
    ------------------------------------------------------- */

    filteredData.sort(
      (a, b) =>
        String(b.arrivalDate)
          .localeCompare(
            String(a.arrivalDate)
          )
    );

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return res.json({
      ok: true,

      source:
        "Government of India - data.gov.in / AGMARKNET",

      count:
        filteredData.length,

      mandi:
        filteredData,
    });

  } catch (error) {
    console.error(
      "MANDI ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "सरकारी मंडी डेटा नहीं मिल पाया।",
    });
  }
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    app: "KisanSaathi AI",

    status: "online",

    ai: Boolean(
      GEMINI_API_KEY
    ),

    aiMode:
      GEMINI_API_KEY
        ? "gemini"
        : "not-configured",

    mandi: Boolean(
      DATA_GOV_API_KEY
    ),

    geminiModel:
      GEMINI_MODEL,
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `KisanSaathi AI backend running on port ${PORT} | Gemini: ${Boolean(
        GEMINI_API_KEY
      )} | Model: ${GEMINI_MODEL} | Mandi: ${Boolean(
        DATA_GOV_API_KEY
      )}`
    );
  }
);

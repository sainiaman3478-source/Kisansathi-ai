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
   HINDI / COMMON CROP NAMES
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
  "soybean": "Soyabean",
  "soyabean": "Soyabean",

  "प्याज": "Onion",
  "onion": "Onion",

  "टमाटर": "Tomato",
  "tomato": "Tomato",

  "आलू": "Potato",
  "potato": "Potato",

  "चना": "Gram",
  "gram": "Gram",

  "अरहर": "Arhar (Tur/Red Gram)",
  "तूर": "Arhar (Tur/Red Gram)",
  "arhar": "Arhar (Tur/Red Gram)",

  "बाजरा": "Bajra (Pearl Millet/Cumbu)",
  "bajra": "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",
  "barley": "Barley",

  "मूंग": "Green Gram (Moong)(Whole)",
  "moong": "Green Gram (Moong)(Whole)",

  "उड़द": "Black Gram (Urd Beans)(Whole)",
  "urad": "Black Gram (Urd Beans)(Whole)",
};

/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/* =========================================================
   FLEXIBLE MATCH
========================================================= */

function flexibleMatch(actual, wanted) {
  const a = normalizeText(actual);
  const w = normalizeText(wanted);

  if (!w) return true;
  if (!a) return false;

  if (a === w) return true;

  if (a.includes(w)) return true;

  if (w.includes(a)) return true;

  return false;
}

/* =========================================================
   STATE MATCH
========================================================= */

function stateMatches(actualState, requestedState) {
  const actual = normalizeText(actualState);
  const requested = normalizeText(requestedState);

  if (!requested) {
    return true;
  }

  /* Delhi variations */

  if (
    requested === "delhi" ||
    requested === "new delhi" ||
    requested === "nct delhi" ||
    requested === "nct of delhi"
  ) {
    return (
      actual.includes("delhi") ||
      actual.includes("nct")
    );
  }

  return flexibleMatch(
    actual,
    requested
  );
}

/* =========================================================
   MARKET MATCH
========================================================= */

function marketMatches(actualMarket, requestedMarket) {
  const actual = normalizeText(actualMarket);
  const requested = normalizeText(requestedMarket);

  if (!requested) {
    return true;
  }

  if (
    requested === "azadpur" ||
    requested === "azadpur mandi"
  ) {
    return actual.includes("azadpur");
  }

  return flexibleMatch(
    actual,
    requested
  );
}

/* =========================================================
   COMMODITY MATCH
========================================================= */

function commodityMatches(
  actualCommodity,
  requestedCommodity
) {
  const actual =
    normalizeText(actualCommodity);

  const requested =
    normalizeText(requestedCommodity);

  if (!requested) {
    return true;
  }

  if (actual === requested) {
    return true;
  }

  if (actual.includes(requested)) {
    return true;
  }

  if (requested.includes(actual)) {
    return true;
  }

  return false;
}

/* =========================================================
   FETCH GOVERNMENT RECORDS
========================================================= */

/*
   IMPORTANT FIX:

   पहले वाला code state + market को Government API में exact
   filters के रूप में भेज रहा था।

   अब:
   - commodity filter Government API को देंगे
   - state/market को बाद में flexible तरीके से filter करेंगे

   इससे:
   Delhi vs NCT of Delhi
   Azadpur vs Azadpur APMC
   जैसे नामों की वजह से data गायब नहीं होगा।
*/

async function fetchMandiRecords(commodity) {
  const allRecords = [];

  const MAX_PAGES = 30;
  const PAGE_SIZE = 100;

  for (
    let page = 0;
    page < MAX_PAGES;
    page++
  ) {
    const offset =
      page * PAGE_SIZE;

    const params =
      new URLSearchParams();

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
      String(PAGE_SIZE)
    );

    params.set(
      "offset",
      String(offset)
    );

    /*
       केवल commodity Government API को देंगे।
    */

    if (commodity) {
      params.set(
        "filters[commodity]",
        commodity
      );
    }

    params.set(
      "sort[arrival_date]",
      "desc"
    );

    const url =
      `https://api.data.gov.in/resource/${RESOURCE}?` +
      params.toString();

    console.log(
      "MANDI PAGE:",
      page + 1,
      "OFFSET:",
      offset,
      "COMMODITY:",
      commodity || "ALL"
    );

    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      });

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
        body?.error?.message ||
          `data.gov.in HTTP ${response.status}`
      );
    }

    const records =
      Array.isArray(body.records)
        ? body.records
        : [];

    allRecords.push(
      ...records
    );

    /*
       अगर इस page पर 100 से कम records आए,
       तो आगे page नहीं है।
    */

    if (
      records.length < PAGE_SIZE
    ) {
      break;
    }
  }

  return allRecords;
}

/* =========================================================
   MANDI API
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

    const rawState =
      String(
        req.query.state || ""
      ).trim();

    const rawCommodity =
      String(
        req.query.commodity ||
          req.query.crop ||
          ""
      ).trim();

    const rawMarket =
      String(
        req.query.market || ""
      ).trim();

    /*
       Hindi/common name को Government name में बदलना
    */

    const commodity =
      aliases[
        rawCommodity.toLowerCase()
      ] || rawCommodity;

    console.log(
      "================================================"
    );

    console.log(
      "MANDI SEARCH"
    );

    console.log(
      "State:",
      rawState || "ALL"
    );

    console.log(
      "Commodity:",
      commodity || "ALL"
    );

    console.log(
      "Market:",
      rawMarket || "ALL"
    );

    console.log(
      "================================================"
    );

    /* -------------------------------------------------------
       GOVERNMENT DATA FETCH
    ------------------------------------------------------- */

    const records =
      await fetchMandiRecords(
        commodity
      );

    console.log(
      "TOTAL GOV RECORDS:",
      records.length
    );

    /* -------------------------------------------------------
       NORMALIZE
    ------------------------------------------------------- */

    const data =
      records
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

    /* -------------------------------------------------------
       FLEXIBLE LOCAL FILTER
    ------------------------------------------------------- */

    const filteredData =
      data.filter((item) => {
        const stateOK =
          stateMatches(
            item.state,
            rawState
          );

        const marketOK =
          marketMatches(
            item.market,
            rawMarket
          );

        const commodityOK =
          commodityMatches(
            item.commodity,
            commodity
          );

        return (
          stateOK &&
          marketOK &&
          commodityOK
        );
      });

    /* -------------------------------------------------------
       SORT
       Latest arrival date first
    ------------------------------------------------------- */

    filteredData.sort((a, b) => {
      const dateA =
        new Date(
          a.arrivalDate
        ).getTime() || 0;

      const dateB =
        new Date(
          b.arrivalDate
        ).getTime() || 0;

      return dateB - dateA;
    });

    console.log(
      "FILTERED RECORDS:",
      filteredData.length
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

      search: {
        state:
          rawState,

        commodity:
          commodity,

        market:
          rawMarket,
      },

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

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

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

/* =========================================================
   KISANSAATHI AI
========================================================= */

const KISAN_SYSTEM_INSTRUCTION = `
You are KisanSaathi AI, a helpful farming assistant for Indian farmers.

Reply in simple Hindi or easy Hinglish.

Be practical, clear and concise.

For crop problems ask when needed:
- crop name
- crop age
- state/district
- symptoms

For fertilizer or pesticide advice:
Do not invent unsafe exact doses.
Follow the product label and local agriculture expert.

Never invent live mandi prices.
Never invent live weather.

If the user asks for live mandi or weather,
tell them to use the app's live sections.

Do not claim you saw a crop photo unless an image was actually provided.
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
   HEALTH
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
    message: "KisanSaathi AI backend running",
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
    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? `Gemini AI error: ${error.message}`
          : "Gemini AI से जवाब नहीं मिला।",
    });
  }
});

/* =========================================================
   COMMODITY ALIASES
========================================================= */

const aliases = {
  "गेहूं": "wheat",
  "गेंहू": "wheat",
  wheat: "wheat",

  "धान": "rice",
  "चावल": "rice",
  rice: "rice",

  "सरसों": "mustard",
  mustard: "mustard",

  "मक्का": "maize",
  "मकई": "maize",
  maize: "maize",

  "कपास": "cotton",
  cotton: "cotton",

  "सोयाबीन": "soyabean",
  "सोया": "soyabean",
  soyabean: "soyabean",
  soybean: "soyabean",

  "प्याज": "onion",
  onion: "onion",

  "टमाटर": "tomato",
  tomato: "tomato",

  "आलू": "potato",
  potato: "potato",

  "चना": "gram",
  gram: "gram",

  "अरहर": "arhar",
  "तूर": "arhar",
  tur: "arhar",

  "बाजरा": "bajra",
  bajra: "bajra",

  "जौ": "barley",
  barley: "barley",

  "मूंग": "moong",
  moong: "moong",

  "उड़द": "urad",
  urad: "urad",
};

/* =========================================================
   TEXT NORMALIZER
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[\/\\_-]/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   COMMODITY MATCH
========================================================= */

function commodityMatches(recordCommodity, wantedCommodity) {
  if (!wantedCommodity) {
    return true;
  }

  const record = cleanText(recordCommodity);
  const wanted = cleanText(wantedCommodity);

  if (!record) {
    return false;
  }

  /*
   Exact match
  */
  if (record === wanted) {
    return true;
  }

  /*
   Normal contains
  */
  if (record.includes(wanted)) {
    return true;
  }

  if (wanted.includes(record)) {
    return true;
  }

  /*
   Common government names
  */

  const groups = {
    potato: [
      "potato",
      "potato local",
      "potato other",
      "potato desi",
    ],

    onion: [
      "onion",
      "onion other",
    ],

    tomato: [
      "tomato",
      "tomato local",
    ],

    wheat: [
      "wheat",
      "wheat faq",
      "wheat dara",
    ],

    rice: [
      "rice",
      "paddy",
      "paddy dhan",
      "common paddy",
    ],

    mustard: [
      "mustard",
      "mustard oil",
      "sarson",
    ],

    maize: [
      "maize",
      "maize other",
    ],

    gram: [
      "gram",
      "chana",
      "bengal gram",
    ],

    soyabean: [
      "soyabean",
      "soybean",
      "soyabean black",
      "soyabean yellow",
    ],

    cotton: [
      "cotton",
      "cotton seed",
    ],

    moong: [
      "green gram",
      "moong",
      "green gram moong whole",
    ],

    urad: [
      "black gram",
      "urd",
      "urad",
      "black gram urd beans whole",
    ],

    arhar: [
      "arhar",
      "tur",
      "red gram",
    ],

    bajra: [
      "bajra",
      "pearl millet",
    ],

    barley: [
      "barley",
      "jau",
    ],
  };

  const wantedGroup = groups[wanted];

  if (wantedGroup) {
    return wantedGroup.some((x) =>
      record.includes(cleanText(x))
    );
  }

  return false;
}

/* =========================================================
   MARKET MATCH
========================================================= */

function marketMatches(recordMarket, wantedMarket) {
  if (!wantedMarket) {
    return true;
  }

  const record = cleanText(recordMarket);
  const wanted = cleanText(wantedMarket);

  if (!record) {
    return false;
  }

  if (record === wanted) {
    return true;
  }

  if (record.includes(wanted)) {
    return true;
  }

  if (wanted.includes(record)) {
    return true;
  }

  /*
   Azadpur spelling variations
  */

  if (
    wanted.includes("azadpur") &&
    record.includes("azadpur")
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   STATE MATCH
========================================================= */

function stateMatches(recordState, wantedState) {
  if (!wantedState) {
    return true;
  }

  const record = cleanText(recordState);
  const wanted = cleanText(wantedState);

  if (!record) {
    return false;
  }

  return (
    record === wanted ||
    record.includes(wanted) ||
    wanted.includes(record)
  );
}

/* =========================================================
   FETCH GOVERNMENT DATA
========================================================= */

async function fetchMandiData({
  state = "",
  commodity = "",
  offset = 0,
  limit = 10000,
}) {
  if (!DATA_GOV_API_KEY) {
    throw new Error(
      "DATA_GOV_API_KEY backend में सेट नहीं है।"
    );
  }

  const params = new URLSearchParams();

  params.set(
    "api-key",
    DATA_GOV_API_KEY
  );

  params.set(
    "format",
    "json"
  );

  /*
   Government API maximum practical page
  */

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(offset)
  );

  /*
   State filter only.
   Commodity exact filter intentionally नहीं लगा रहे,
   क्योंकि Government records में commodity names अलग-अलग
   format में आ सकते हैं।
  */

  if (state) {
    params.set(
      "filters[state.keyword]",
      state
    );
  }

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

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
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
      body?.error ||
        body?.message ||
        `data.gov.in HTTP ${response.status}`
    );
  }

  return body;
}

/* =========================================================
   NORMALIZE RECORDS
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
          String(item.min_price || "")
            .replace(/,/g, "")
        ) || 0,

      maxPrice:
        Number(
          String(item.max_price || "")
            .replace(/,/g, "")
        ) || 0,

      modalPrice:
        Number(
          String(item.modal_price || "")
            .replace(/,/g, "")
        ) || 0,
    }))
    .filter(
      (item) =>
        item.modalPrice > 0 ||
        item.minPrice > 0 ||
        item.maxPrice > 0
    );
}

/* =========================================================
   REAL GOVERNMENT MANDI
========================================================= */

app.get("/api/mandi", async (req, res) => {
  try {
    if (!DATA_GOV_API_KEY) {
      return res.status(503).json({
        ok: false,
        error:
          "DATA_GOV_API_KEY Render Environment में सेट नहीं है।",
      });
    }

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
     Hindi → standard search word
    */

    const commodity =
      aliases[
        cleanText(rawCommodity)
      ] || cleanText(rawCommodity);

    console.log(
      "===================================="
    );

    console.log(
      "MANDI SEARCH:",
      {
        state: rawState,
        commodity,
        market: rawMarket,
      }
    );

    console.log(
      "===================================="
    );

    /* =====================================================
       STEP 1
       STATE DATA
    ===================================================== */

    let body =
      await fetchMandiData({
        state: rawState,
        offset: 0,
        limit: 10000,
      });

    let records =
      Array.isArray(body.records)
        ? body.records
        : [];

    let data =
      normalizeRecords(records);

    console.log(
      "GOVERNMENT RECORDS:",
      data.length
    );

    /* =====================================================
       STEP 2
       LOCAL FILTER
    ===================================================== */

    let filteredData =
      data.filter((item) => {
        return (
          stateMatches(
            item.state,
            rawState
          ) &&
          commodityMatches(
            item.commodity,
            commodity
          ) &&
          marketMatches(
            item.market,
            rawMarket
          )
        );
      });

    console.log(
      "FILTERED RECORDS:",
      filteredData.length
    );

    /* =====================================================
       STEP 3
       IF MARKET SEARCH GIVES ZERO,
       SEARCH WITHOUT MARKET
    ===================================================== */

    if (
      filteredData.length === 0 &&
      rawMarket &&
      commodity
    ) {
      console.log(
        "MARKET FALLBACK SEARCH"
      );

      filteredData =
        data.filter((item) => {
          return (
            stateMatches(
              item.state,
              rawState
            ) &&
            commodityMatches(
              item.commodity,
              commodity
            )
          );
        });
    }

    /* =====================================================
       STEP 4
       IF STILL ZERO, SEARCH WHOLE STATE
       WITH MARKET ONLY
    ===================================================== */

    if (
      filteredData.length === 0 &&
      rawMarket
    ) {
      console.log(
        "STATE + MARKET FALLBACK"
      );

      filteredData =
        data.filter((item) => {
          return (
            stateMatches(
              item.state,
              rawState
            ) &&
            marketMatches(
              item.market,
              rawMarket
            )
          );
        });
    }

    /* =====================================================
       SORT LATEST FIRST
    ===================================================== */

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

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const seen = new Set();

    filteredData =
      filteredData.filter((item) => {
        const key =
          [
            item.state,
            item.district,
            item.market,
            item.commodity,
            item.variety,
            item.grade,
            item.arrivalDate,
            item.minPrice,
            item.maxPrice,
            item.modalPrice,
          ]
            .join("|")
            .toLowerCase();

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      ok: true,

      source:
        "Government of India - data.gov.in / AGMARKNET",

      search: {
        state: rawState,
        commodity: rawCommodity,
        market: rawMarket,
      },

      count:
        filteredData.length,

      mandi:
        filteredData.slice(0, 200),
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

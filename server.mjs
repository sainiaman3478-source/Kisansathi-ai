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

    const reply =
      await geminiReply(message);

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
   COMMODITY ALIASES
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
  "potatoes": "Potato",

  "चना": "Gram",
  "gram": "Gram",

  "अरहर": "Arhar (Tur/Red Gram)",
  "arhar": "Arhar (Tur/Red Gram)",

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
   TEXT NORMALIZER
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[()[\]{}.,/\\_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   FUZZY MATCH
========================================================= */

function textMatches(value, search) {
  const a = normalizeText(value);
  const b = normalizeText(search);

  if (!b) return true;
  if (!a) return false;

  if (a === b) return true;

  if (a.includes(b)) return true;

  if (b.includes(a)) return true;

  const words = b
    .split(" ")
    .filter(Boolean);

  return words.every((word) =>
    a.includes(word)
  );
}

/* =========================================================
   STATE MATCH
========================================================= */

function stateMatches(value, search) {
  if (!search) return true;

  const a = normalizeText(value);
  const b = normalizeText(search);

  if (textMatches(a, b)) {
    return true;
  }

  const stateAliases = {
    delhi: [
      "delhi",
      "nct of delhi",
      "national capital territory of delhi",
    ],

    "new delhi": [
      "delhi",
      "nct of delhi",
      "national capital territory of delhi",
    ],

    haryana: [
      "haryana",
    ],

    punjab: [
      "punjab",
    ],

    rajasthan: [
      "rajasthan",
    ],

    "uttar pradesh": [
      "uttar pradesh",
      "up",
    ],
  };

  const list =
    stateAliases[b] || [b];

  return list.some((x) =>
    textMatches(a, x)
  );
}

/* =========================================================
   COMMODITY MATCH
========================================================= */

function commodityMatches(
  value,
  search
) {
  if (!search) return true;

  const actual =
    normalizeText(value);

  const requested =
    normalizeText(
      aliases[search.toLowerCase()] ||
        search
    );

  if (textMatches(actual, requested)) {
    return true;
  }

  /* Special common mandi names */

  if (
    requested === "potato" &&
    (
      actual.includes("potato") ||
      actual.includes("आलू")
    )
  ) {
    return true;
  }

  if (
    requested === "wheat" &&
    actual.includes("wheat")
  ) {
    return true;
  }

  if (
    requested === "rice" &&
    (
      actual.includes("rice") ||
      actual.includes("paddy")
    )
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   GOVERNMENT API FETCH
========================================================= */

async function fetchGovernmentRecords({
  state = "",
  commodity = "",
  market = "",
  limit = 5000,
}) {
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
    String(limit)
  );

  params.set(
    "offset",
    "0"
  );

  /*
     IMPORTANT:
     Government API exact filters कभी-कभी zero result
     दे देते हैं। इसलिए filters optional रखे हैं।
  */

  if (commodity) {
    params.set(
      "filters[commodity]",
      commodity
    );
  }

  if (state) {
    params.set(
      "filters[state]",
      state
    );
  }

  if (market) {
    params.set(
      "filters[market]",
      market
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
    "MANDI REQUEST:",
    url.replace(
      DATA_GOV_API_KEY,
      "HIDDEN_KEY"
    )
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
      body?.error ||
        `data.gov.in HTTP ${response.status}`
    );
  }

  return Array.isArray(body.records)
    ? body.records
    : [];
}

/* =========================================================
   NORMALIZE GOVERNMENT RECORD
========================================================= */

function normalizeMandiRecord(item) {
  return {
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
      item.arrival_date ||
      item.arrivalDate ||
      "",

    minPrice:
      Number(
        String(
          item.min_price || 0
        ).replace(/,/g, "")
      ) || 0,

    maxPrice:
      Number(
        String(
          item.max_price || 0
        ).replace(/,/g, "")
      ) || 0,

    modalPrice:
      Number(
        String(
          item.modal_price || 0
        ).replace(/,/g, "")
      ) || 0,
  };
}

/* =========================================================
   LOCAL FILTER
========================================================= */

function filterMandiRecords(
  records,
  {
    state,
    commodity,
    market,
  }
) {
  return records
    .map(normalizeMandiRecord)
    .filter(
      (item) =>
        item.modalPrice > 0
    )
    .filter((item) => {
      const stateOK =
        stateMatches(
          item.state,
          state
        );

      const commodityOK =
        commodityMatches(
          item.commodity,
          commodity
        );

      const marketOK =
        textMatches(
          item.market,
          market
        );

      return (
        stateOK &&
        commodityOK &&
        marketOK
      );
    });
}

/* =========================================================
   REAL MANDI API
========================================================= */

app.get(
  "/api/mandi",
  async (req, res) => {
    try {
      if (!DATA_GOV_API_KEY) {
        return res.status(503).json({
          ok: false,

          error:
            "DATA_GOV_API_KEY backend में सेट नहीं है। Render Environment में key डालें।",
        });
      }

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

      let records = [];

      /* =====================================================
         ATTEMPT 1
         Exact government filters
      ===================================================== */

      try {
        records =
          await fetchGovernmentRecords({
            state: rawState,
            commodity,
            market: rawMarket,
            limit: 5000,
          });
      } catch (e) {
        console.error(
          "MANDI ATTEMPT 1 FAILED:",
          e
        );
      }

      let filtered =
        filterMandiRecords(
          records,
          {
            state: rawState,
            commodity: rawCommodity,
            market: rawMarket,
          }
        );

      console.log(
        "MANDI ATTEMPT 1:",
        records.length,
        "records /",
        filtered.length,
        "matched"
      );

      /* =====================================================
         ATTEMPT 2
         State + Commodity
         Market filter हटाओ
      ===================================================== */

      if (
        filtered.length === 0 &&
        (rawState || commodity)
      ) {
        try {
          records =
            await fetchGovernmentRecords({
              state: rawState,
              commodity,
              market: "",
              limit: 5000,
            });

          filtered =
            filterMandiRecords(
              records,
              {
                state: rawState,
                commodity: rawCommodity,
                market: rawMarket,
              }
            );

          console.log(
            "MANDI ATTEMPT 2:",
            records.length,
            "records /",
            filtered.length,
            "matched"
          );
        } catch (e) {
          console.error(
            "MANDI ATTEMPT 2 FAILED:",
            e
          );
        }
      }

      /* =====================================================
         ATTEMPT 3
         State only
         Commodity और market locally खोजेंगे
      ===================================================== */

      if (
        filtered.length === 0 &&
        rawState
      ) {
        try {
          records =
            await fetchGovernmentRecords({
              state: rawState,
              commodity: "",
              market: "",
              limit: 10000,
            });

          filtered =
            filterMandiRecords(
              records,
              {
                state: rawState,
                commodity: rawCommodity,
                market: rawMarket,
              }
            );

          console.log(
            "MANDI ATTEMPT 3:",
            records.length,
            "records /",
            filtered.length,
            "matched"
          );
        } catch (e) {
          console.error(
            "MANDI ATTEMPT 3 FAILED:",
            e
          );
        }
      }

      /* =====================================================
         ATTEMPT 4
         Commodity only
         State + market locally खोजेंगे
      ===================================================== */

      if (
        filtered.length === 0 &&
        commodity
      ) {
        try {
          records =
            await fetchGovernmentRecords({
              state: "",
              commodity,
              market: "",
              limit: 10000,
            });

          filtered =
            filterMandiRecords(
              records,
              {
                state: rawState,
                commodity: rawCommodity,
                market: rawMarket,
              }
            );

          console.log(
            "MANDI ATTEMPT 4:",
            records.length,
            "records /",
            filtered.length,
            "matched"
          );
        } catch (e) {
          console.error(
            "MANDI ATTEMPT 4 FAILED:",
            e
          );
        }
      }

      /* =====================================================
         ATTEMPT 5
         No government filter
         Last fallback
      ===================================================== */

      if (
        filtered.length === 0 &&
        !rawState &&
        !commodity &&
        !rawMarket
      ) {
        try {
          records =
            await fetchGovernmentRecords({
              limit: 10000,
            });

          filtered =
            filterMandiRecords(
              records,
              {
                state: "",
                commodity: "",
                market: "",
              }
            );

          console.log(
            "MANDI ATTEMPT 5:",
            records.length,
            "records"
          );
        } catch (e) {
          console.error(
            "MANDI ATTEMPT 5 FAILED:",
            e
          );
        }
      }

      /* =====================================================
         SORT
         Newest first
      ===================================================== */

      filtered.sort(
        (a, b) => {
          const da =
            new Date(
              a.arrivalDate
            ).getTime() || 0;

          const db =
            new Date(
              b.arrivalDate
            ).getTime() || 0;

          return db - da;
        }
      );

      /* =====================================================
         REMOVE DUPLICATES
      ===================================================== */

      const seen =
        new Set();

      const unique =
        filtered.filter(
          (item) => {
            const key =
              [
                item.state,
                item.district,
                item.market,
                item.commodity,
                item.variety,
                item.grade,
                item.arrivalDate,
                item.modalPrice,
              ]
                .map(normalizeText)
                .join("|");

            if (seen.has(key)) {
              return false;
            }

            seen.add(key);

            return true;
          }
        );

      /* =====================================================
         LIMIT FRONTEND RESULT
      ===================================================== */

      const finalData =
        unique.slice(0, 100);

      console.log(
        "MANDI FINAL RESULT:",
        finalData.length
      );

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.json({
        ok: true,

        source:
          "Government of India - data.gov.in / AGMARKNET",

        count:
          finalData.length,

        mandi:
          finalData,
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
  }
);

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

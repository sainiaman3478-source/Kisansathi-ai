import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

/* =========================================================
   BASIC SETUP
========================================================= */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;

const DATA_GOV_API_KEY =
  process.env.DATA_GOV_API_KEY?.trim();

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY?.trim();

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

/* =========================================================
   GOVERNMENT MANDI RESOURCE
========================================================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

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

For fertilizer or pesticide advice:
Do not invent unsafe exact doses.
Follow the product label and local agriculture expert when exact dosage
depends on product, crop or region.

Never invent live mandi prices or live weather.

If the user asks for live mandi/weather, tell them to use the app's
live mandi/weather sections.

Do not claim you saw a crop photo unless an image was actually provided.
`;

/* =========================================================
   TEXT HELPERS
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeForSearch(value) {
  return cleanText(value)
    .replace(/[()]/g, "")
    .replace(/[-_/]/g, " ");
}

/* =========================================================
   CROP ALIASES
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

  "तूर":
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
   MANDI RECORD NORMALIZER
========================================================= */

function normalizeRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

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
        item.minPrice > 0 ||
        item.maxPrice > 0 ||
        item.modalPrice > 0
    );
}

/* =========================================================
   DATA.GOV REQUEST
========================================================= */

async function requestMandiPage({
  state = "",
  commodity = "",
  market = "",
  filterMode = "keyword",
  offset = 0,
  limit = 1000,
}) {
  if (!DATA_GOV_API_KEY) {
    throw new Error(
      "DATA_GOV_API_KEY backend में सेट नहीं है।"
    );
  }

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
    String(offset)
  );

  /*
   * IMPORTANT:
   * data.gov.in इस resource में state.keyword
   * exposed field है।
   *
   * लेकिन कुछ responses में normal state filter
   * ज्यादा reliable हो सकता है।
   *
   * इसलिए दोनों modes नीचे try होंगे।
   */

  if (state) {
    if (filterMode === "keyword") {
      params.set(
        "filters[state.keyword]",
        state
      );
    } else {
      params.set(
        "filters[state]",
        state
      );
    }
  }

  if (commodity) {
    params.set(
      "filters[commodity]",
      commodity
    );
  }

  if (market) {
    params.set(
      "filters[market]",
      market
    );
  }

  const url =
    `https://api.data.gov.in/resource/${RESOURCE}?` +
    params.toString();

  console.log(
    "MANDI API REQUEST:",
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
        body?.message ||
        `data.gov.in HTTP ${response.status}`
    );
  }

  return body;
}

/* =========================================================
   FETCH ALL MATCHING RECORDS
========================================================= */

async function fetchMandiData({
  state = "",
  commodity = "",
  market = "",
  filterMode = "keyword",
}) {
  let offset = 0;

  const pageSize = 1000;

  const maxPages = 5;

  let allRecords = [];

  for (
    let page = 0;
    page < maxPages;
    page++
  ) {
    const body =
      await requestMandiPage({
        state,
        commodity,
        market,
        filterMode,
        offset,
        limit: pageSize,
      });

    const records =
      Array.isArray(body?.records)
        ? body.records
        : [];

    allRecords =
      allRecords.concat(records);

    const count =
      Number(body?.count || 0);

    const total =
      Number(body?.total || 0);

    console.log(
      "MANDI PAGE:",
      {
        offset,
        count,
        total,
      }
    );

    if (records.length === 0) {
      break;
    }

    if (
      total > 0 &&
      allRecords.length >= total
    ) {
      break;
    }

    if (records.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return normalizeRecords(
    allRecords
  );
}

/* =========================================================
   LOCAL FILTER
========================================================= */

function filterLocalRecords(
  records,
  {
    state = "",
    commodity = "",
    market = "",
    district = "",
  }
) {
  const stateSearch =
    normalizeForSearch(state);

  const commoditySearch =
    normalizeForSearch(commodity);

  const marketSearch =
    normalizeForSearch(market);

  const districtSearch =
    normalizeForSearch(district);

  return records.filter(
    (item) => {
      const stateText =
        normalizeForSearch(
          item.state
        );

      const commodityText =
        normalizeForSearch(
          item.commodity
        );

      const marketText =
        normalizeForSearch(
          item.market
        );

      const districtText =
        normalizeForSearch(
          item.district
        );

      const stateOK =
        !stateSearch ||
        stateText.includes(
          stateSearch
        );

      const commodityOK =
        !commoditySearch ||
        commodityText.includes(
          commoditySearch
        );

      const marketOK =
        !marketSearch ||
        marketText.includes(
          marketSearch
        );

      const districtOK =
        !districtSearch ||
        districtText.includes(
          districtSearch
        );

      return (
        stateOK &&
        commodityOK &&
        marketOK &&
        districtOK
      );
    }
  );
}

/* =========================================================
   REMOVE DUPLICATES
========================================================= */

function uniqueRecords(records) {
  const seen =
    new Set();

  const result = [];

  for (const item of records) {
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
        .map((v) =>
          cleanText(v)
        )
        .join("|");

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/* =========================================================
   SORT MANDI RECORDS
========================================================= */

function sortMandiRecords(records) {
  return [...records].sort(
    (a, b) => {
      const dateCompare =
        String(b.arrivalDate)
          .localeCompare(
            String(a.arrivalDate)
          );

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (
        Number(b.modalPrice || 0) -
        Number(a.modalPrice || 0)
      );
    }
  );
}

/* =========================================================
   REAL GOVERNMENT MANDI API
========================================================= */

app.get(
  "/api/mandi",
  async (req, res) => {
    try {
      if (!DATA_GOV_API_KEY) {
        return res.status(503).json({
          ok: false,

          error:
            "DATA_GOV_API_KEY Render Environment में सेट नहीं है।",
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

      const rawDistrict =
        String(
          req.query.district || ""
        ).trim();

      const commodity =
        aliases[
          cleanText(
            rawCommodity
          )
        ] || rawCommodity;

      console.log(
        "================================="
      );

      console.log(
        "MANDI SEARCH:",
        {
          state: rawState,
          commodity,
          market: rawMarket,
          district: rawDistrict,
        }
      );

      console.log(
        "================================="
      );

      /*
       ======================================================
       STRATEGY 1
       State + Commodity
       ======================================================
      */

      let data = [];

      if (
        rawState &&
        commodity
      ) {
        data =
          await fetchMandiData({
            state: rawState,
            commodity,
            filterMode:
              "keyword",
          });

        console.log(
          "STRATEGY 1 RECORDS:",
          data.length
        );
      }

      /*
       ======================================================
       STRATEGY 2
       State + Commodity using normal state field
       ======================================================
      */

      if (
        data.length === 0 &&
        rawState &&
        commodity
      ) {
        data =
          await fetchMandiData({
            state: rawState,
            commodity,
            filterMode:
              "normal",
          });

        console.log(
          "STRATEGY 2 RECORDS:",
          data.length
        );
      }

      /*
       ======================================================
       STRATEGY 3
       Commodity only
       ======================================================
      */

      if (
        data.length === 0 &&
        commodity
      ) {
        data =
          await fetchMandiData({
            state: "",
            commodity,
            filterMode:
              "keyword",
          });

        console.log(
          "STRATEGY 3 RECORDS:",
          data.length
        );
      }

      /*
       ======================================================
       STRATEGY 4
       State only
       ======================================================
      */

      if (
        data.length === 0 &&
        rawState
      ) {
        data =
          await fetchMandiData({
            state: rawState,
            commodity: "",
            filterMode:
              "keyword",
          });

        console.log(
          "STRATEGY 4 RECORDS:",
          data.length
        );
      }

      /*
       ======================================================
       STRATEGY 5
       Market only
       ======================================================
      */

      if (
        data.length === 0 &&
        rawMarket
      ) {
        data =
          await fetchMandiData({
            state: "",
            commodity: "",
            market: rawMarket,
            filterMode:
              "keyword",
          });

        console.log(
          "STRATEGY 5 RECORDS:",
          data.length
        );
      }

      /*
       ======================================================
       LOCAL FILTER
       ======================================================
      */

      let filtered =
        filterLocalRecords(
          data,
          {
            state: rawState,
            commodity,
            market: rawMarket,
            district:
              rawDistrict,
          }
        );

      /*
       ======================================================
       IMPORTANT FALLBACK

       अगर API ने commodity filter के कारण
       data कम दिया है तो market खोजने के लिए
       state-only data भी इस्तेमाल करेंगे।
       ======================================================
      */

      if (
        filtered.length === 0 &&
        rawState &&
        rawMarket
      ) {
        console.log(
          "LOCAL FALLBACK: state + market"
        );

        let stateData = [];

        try {
          stateData =
            await fetchMandiData({
              state: rawState,
              commodity: "",
              filterMode:
                "keyword",
            });
        } catch (e) {
          console.error(
            "State fallback failed:",
            e
          );
        }

        if (
          stateData.length === 0
        ) {
          try {
            stateData =
              await fetchMandiData({
                state: rawState,
                commodity: "",
                filterMode:
                  "normal",
              });
          } catch (e) {
            console.error(
              "State normal fallback failed:",
              e
            );
          }
        }

        filtered =
          filterLocalRecords(
            stateData,
            {
              state: rawState,
              commodity,
              market: rawMarket,
              district:
                rawDistrict,
            }
          );
      }

      /*
       ======================================================
       MARKET ONLY FALLBACK
       ======================================================
      */

      if (
        filtered.length === 0 &&
        rawMarket
      ) {
        console.log(
          "LOCAL FALLBACK: market only"
        );

        let marketData = [];

        try {
          marketData =
            await fetchMandiData({
              state: "",
              commodity: "",
              market: rawMarket,
              filterMode:
                "keyword",
            });
        } catch (e) {
          console.error(
            "Market fallback failed:",
            e
          );
        }

        filtered =
          filterLocalRecords(
            marketData,
            {
              state: rawState,
              commodity,
              market: rawMarket,
              district:
                rawDistrict,
            }
          );
      }

      /*
       ======================================================
       UNIQUE + SORT
       ======================================================
      */

      filtered =
        uniqueRecords(
          filtered
        );

      filtered =
        sortMandiRecords(
          filtered
        );

      /*
       ======================================================
       RESPONSE
       ======================================================
      */

      console.log(
        "FINAL MANDI RECORDS:",
        filtered.length
      );

      return res.json({
        ok: true,

        source:
          "Government of India - data.gov.in / AGMARKNET",

        resource:
          RESOURCE,

        search: {
          state: rawState,
          commodity,
          market: rawMarket,
          district:
            rawDistrict,
        },

        count:
          filtered.length,

        mandi:
          filtered,
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

app.get(
  "/",
  (req, res) => {
    res.json({
      app:
        "KisanSaathi AI",

      status:
        "online",

      ai:
        Boolean(
          GEMINI_API_KEY
        ),

      aiMode:
        GEMINI_API_KEY
          ? "gemini"
          : "not-configured",

      mandi:
        Boolean(
          DATA_GOV_API_KEY
        ),

      geminiModel:
        GEMINI_MODEL,

      mandiResource:
        RESOURCE,
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "================================="
    );

    console.log(
      `KisanSaathi AI backend running on port ${PORT}`
    );

    console.log(
      `Gemini: ${Boolean(
        GEMINI_API_KEY
      )}`
    );

    console.log(
      `Model: ${GEMINI_MODEL}`
    );

    console.log(
      `Mandi API Key: ${Boolean(
        DATA_GOV_API_KEY
      )}`
    );

    console.log(
      `Mandi Resource: ${RESOURCE}`
    );

    console.log(
      "================================="
    );
  }
);

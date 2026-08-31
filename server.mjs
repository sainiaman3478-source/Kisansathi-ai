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

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;

const DATA_GOV_API_KEY =
  process.env.DATA_GOV_API_KEY;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
Tell the farmer to follow the product label and local agriculture expert
when dosage depends on crop, product or region.

Never invent live mandi prices.

Never invent live weather.

If the user asks for live mandi prices, tell them to use the app's
Mandi section.

If the user asks about weather, tell them to use the app's Weather section.

Do not claim that you saw a crop photo unless an image was actually
provided to the API.
`;

/* =========================================================
   GEMINI AI
========================================================= */

async function geminiReply(message) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY Render Environment में सेट नहीं है।"
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
   GOVERNMENT MANDI DATA
========================================================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

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

  "अरहर": "Arhar (Tur/Red Gram)",
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
   TEXT NORMALIZER
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   GOVT API REQUEST
========================================================= */

async function fetchMandiData({
  state = "",
  district = "",
  commodity = "",
  market = "",
  limit = 1000,
  offset = 0,
}) {
  if (!DATA_GOV_API_KEY) {
    throw new Error(
      "DATA_GOV_API_KEY Render Environment में सेट नहीं है।"
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

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(offset)
  );

  /*
   Government API का सही state filter
  */

  if (state) {
    params.set(
      "filters[state.keyword]",
      state
    );
  }

  if (district) {
    params.set(
      "filters[district]",
      district
    );
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
   NORMALIZE RECORD
========================================================= */

function normalizeRecord(item) {
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
      item.arrival_date || "",

    minPrice:
      Number(
        String(
          item.min_price || "0"
        ).replace(/,/g, "")
      ) || 0,

    maxPrice:
      Number(
        String(
          item.max_price || "0"
        ).replace(/,/g, "")
      ) || 0,

    modalPrice:
      Number(
        String(
          item.modal_price || "0"
        ).replace(/,/g, "")
      ) || 0,
  };
}

function normalizeRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map(normalizeRecord)
    .filter(
      (item) =>
        item.minPrice > 0 ||
        item.maxPrice > 0 ||
        item.modalPrice > 0
    );
}

/* =========================================================
   MARKET MATCH
========================================================= */

function marketMatches(
  market,
  search
) {
  if (!search) {
    return true;
  }

  const a = cleanText(market);
  const b = cleanText(search);

  if (!a || !b) {
    return false;
  }

  return (
    a === b ||
    a.includes(b) ||
    b.includes(a)
  );
}

/* =========================================================
   COMMODITY MATCH
========================================================= */

function commodityMatches(
  commodity,
  search
) {
  if (!search) {
    return true;
  }

  const a = cleanText(commodity);
  const b = cleanText(search);

  if (!a || !b) {
    return false;
  }

  return (
    a === b ||
    a.includes(b) ||
    b.includes(a)
  );
}

/* =========================================================
   MANDI API
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

      const rawDistrict =
        String(
          req.query.district || ""
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
        "================================================"
      );

      console.log(
        "MANDI SEARCH:",
        {
          state: rawState,
          district: rawDistrict,
          commodity,
          market: rawMarket,
        }
      );

      console.log(
        "================================================"
      );

      /*
       ------------------------------------------------------
       STEP 1
       State + Commodity
       ------------------------------------------------------
      */

      let body =
        await fetchMandiData({
          state: rawState,
          district: rawDistrict,
          commodity,
          limit: 1000,
          offset: 0,
        });

      let records =
        Array.isArray(body.records)
          ? body.records
          : [];

      let data =
        normalizeRecords(records);

      console.log(
        "STEP 1 RECORDS:",
        data.length
      );

      /*
       ------------------------------------------------------
       STEP 2
       Local filtering
       ------------------------------------------------------
      */

      const stateSearch =
        cleanText(rawState);

      const districtSearch =
        cleanText(rawDistrict);

      let filtered =
        data.filter((item) => {
          const stateOK =
            !stateSearch ||
            cleanText(item.state)
              .includes(stateSearch) ||
            stateSearch.includes(
              cleanText(item.state)
            );

          const districtOK =
            !districtSearch ||
            cleanText(item.district)
              .includes(
                districtSearch
              );

          const commodityOK =
            commodityMatches(
              item.commodity,
              commodity
            );

          const marketOK =
            marketMatches(
              item.market,
              rawMarket
            );

          return (
            stateOK &&
            districtOK &&
            commodityOK &&
            marketOK
          );
        });

      /*
       ------------------------------------------------------
       STEP 3
       IMPORTANT FALLBACK

       अगर market search के कारण result नहीं मिला,
       तो State + Commodity से दोबारा पूरा data लेकर
       market को locally खोजेंगे।
       ------------------------------------------------------
      */

      if (
        filtered.length === 0 &&
        rawMarket
      ) {
        console.log(
          "MANDI FALLBACK 1: State + Commodity"
        );

        body =
          await fetchMandiData({
            state: rawState,
            district: rawDistrict,
            commodity,
            limit: 1000,
            offset: 0,
          });

        records =
          Array.isArray(body.records)
            ? body.records
            : [];

        data =
          normalizeRecords(records);

        filtered =
          data.filter((item) =>
            marketMatches(
              item.market,
              rawMarket
            )
          );

        console.log(
          "FALLBACK 1 RESULTS:",
          filtered.length
        );
      }

      /*
       ------------------------------------------------------
       STEP 4
       अगर commodity filter से भी कुछ नहीं मिला,
       State के सारे records लेकर local crop search।
       ------------------------------------------------------
      */

      if (
        filtered.length === 0 &&
        rawState
      ) {
        console.log(
          "MANDI FALLBACK 2: State only"
        );

        body =
          await fetchMandiData({
            state: rawState,
            district: rawDistrict,
            commodity: "",
            limit: 1000,
            offset: 0,
          });

        records =
          Array.isArray(body.records)
            ? body.records
            : [];

        data =
          normalizeRecords(records);

        filtered =
          data.filter((item) => {
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
              marketOK &&
              commodityOK
            );
          });

        console.log(
          "FALLBACK 2 RESULTS:",
          filtered.length
        );
      }

      /*
       ------------------------------------------------------
       STEP 5
       अगर market नहीं दिया गया तो crop/state results
       ------------------------------------------------------
      */

      if (
        filtered.length === 0 &&
        !rawMarket
      ) {
        filtered =
          data.filter((item) =>
            commodityMatches(
              item.commodity,
              commodity
            )
          );
      }

      /*
       ------------------------------------------------------
       SORT
       ------------------------------------------------------
      */

      filtered.sort(
        (a, b) => {
          const dateA =
            String(
              a.arrivalDate || ""
            );

          const dateB =
            String(
              b.arrivalDate || ""
            );

          return dateB.localeCompare(
            dateA
          );
        }
      );

      /*
       ------------------------------------------------------
       RESPONSE
       ------------------------------------------------------
      */

      console.log(
        "FINAL MANDI RESULTS:",
        filtered.length
      );

      return res.json({
        ok: true,

        source:
          "Government of India - data.gov.in / AGMARKNET",

        search: {
          state: rawState,
          district: rawDistrict,
          commodity,
          market: rawMarket,
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
      `KisanSaathi AI backend running on port ${PORT} | ` +
      `Gemini: ${Boolean(GEMINI_API_KEY)} | ` +
      `Model: ${GEMINI_MODEL} | ` +
      `Mandi: ${Boolean(DATA_GOV_API_KEY)}`
    );
  }
);

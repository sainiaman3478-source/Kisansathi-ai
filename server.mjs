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

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
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
          maxOutputTokens: 500,
        },
      }),

      signal: controller.signal,
    });

    const body =
      await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "GEMINI API ERROR:",
        JSON.stringify(body, null, 2)
      );

      const apiMessage =
        body?.error?.message ||
        body?.message ||
        `Gemini API HTTP ${response.status}`;

      throw new Error(apiMessage);
    }

    const reply =
      body?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("")
        .trim();

    if (!reply) {
      console.error(
        "GEMINI EMPTY RESPONSE:",
        JSON.stringify(body, null, 2)
      );

      throw new Error(
        "Gemini ने कोई जवाब नहीं दिया।"
      );
    }

    return reply;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Gemini AI ने 30 सेकंड में जवाब नहीं दिया।"
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
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
   ALIASES
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
  "aloo": "Potato",
  "potato": "Potato",

  "चना": "Gram",
  "gram": "Gram",

  "अरहर": "Arhar (Tur/Red Gram)",
  "बाजरा": "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",
  "barley": "Barley",

  "मूंग": "Green Gram (Moong)(Whole)",

  "उड़द":
    "Black Gram (Urd Beans)(Whole)",
};

/* =========================================================
   TEXT NORMALIZE
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =========================================================
   NORMALIZE SEARCH
========================================================= */

function normalizeSearch(value) {
  return cleanText(value)
    .replace(/[(),./_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   FIELD MATCH
========================================================= */

function textMatches(value, search) {
  if (!search) {
    return true;
  }

  const valueText =
    normalizeSearch(value);

  const searchText =
    normalizeSearch(search);

  if (!valueText) {
    return false;
  }

  if (valueText === searchText) {
    return true;
  }

  return valueText.includes(searchText);
}

/* =========================================================
   GOVERNMENT API REQUEST
========================================================= */

async function fetchMandiPage({
  state = "",
  commodity = "",
  market = "",
  offset = 0,
  limit = 1000,
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
    "offset",
    String(offset)
  );

  params.set(
    "limit",
    String(limit)
  );

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
   NORMALIZE RECORD
========================================================= */

function normalizeRecord(item) {
  return {
    state:
      item?.state || "",

    district:
      item?.district || "",

    market:
      item?.market || "",

    commodity:
      item?.commodity || "",

    variety:
      item?.variety || "",

    grade:
      item?.grade || "",

    arrivalDate:
      item?.arrival_date || "",

    minPrice:
      Number(
        String(
          item?.min_price ?? ""
        ).replace(/,/g, "")
      ) || 0,

    maxPrice:
      Number(
        String(
          item?.max_price ?? ""
        ).replace(/,/g, "")
      ) || 0,

    modalPrice:
      Number(
        String(
          item?.modal_price ?? ""
        ).replace(/,/g, "")
      ) || 0,
  };
}

/* =========================================================
   NORMALIZE RECORDS
========================================================= */

function normalizeRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map(normalizeRecord)
    .filter(
      (item) =>
        item.modalPrice > 0
    );
}

/* =========================================================
   LOCAL FILTER
========================================================= */

function filterRecords(
  records,
  {
    state = "",
    commodity = "",
    market = "",
  }
) {
  return records.filter(
    (item) => {
      const stateOK =
        textMatches(
          item.state,
          state
        );

      const commodityOK =
        textMatches(
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
    }
  );
}

/* =========================================================
   FETCH WITH FALLBACKS
========================================================= */

async function searchMandi({
  state,
  commodity,
  market,
}) {
  console.log(
    "MANDI SEARCH ATTEMPT 1:",
    {
      state,
      commodity,
      market,
    }
  );

  try {
    const body =
      await fetchMandiPage({
        state,
        commodity,
        market,
        offset: 0,
        limit: 1000,
      });

    const records =
      normalizeRecords(
        body.records
      );

    const filtered =
      filterRecords(
        records,
        {
          state,
          commodity,
          market,
        }
      );

    if (filtered.length > 0) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 1 ERROR:",
      error
    );
  }

  console.log(
    "MANDI SEARCH ATTEMPT 2: state + commodity"
  );

  try {
    const body =
      await fetchMandiPage({
        state,
        commodity,
        market: "",
        offset: 0,
        limit: 1000,
      });

    const records =
      normalizeRecords(
        body.records
      );

    const filtered =
      filterRecords(
        records,
        {
          state,
          commodity,
          market,
        }
      );

    if (filtered.length > 0) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 2 ERROR:",
      error
    );
  }

  console.log(
    "MANDI SEARCH ATTEMPT 3: state only"
  );

  try {
    const body =
      await fetchMandiPage({
        state,
        commodity: "",
        market: "",
        offset: 0,
        limit: 1000,
      });

    const records =
      normalizeRecords(
        body.records
      );

    const filtered =
      filterRecords(
        records,
        {
          state,
          commodity,
          market,
        }
      );

    if (filtered.length > 0) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 3 ERROR:",
      error
    );
  }

  console.log(
    "MANDI SEARCH ATTEMPT 4: no API filters"
  );

  try {
    let allRecords = [];

    const PAGE_SIZE = 1000;

    for (
      let page = 0;
      page < 5;
      page++
    ) {
      const body =
        await fetchMandiPage({
          state: "",
          commodity: "",
          market: "",
          offset:
            page * PAGE_SIZE,
          limit: PAGE_SIZE,
        });

      const records =
        normalizeRecords(
          body.records
        );

      allRecords =
        allRecords.concat(
          records
        );

      if (
        !Array.isArray(
          body.records
        ) ||
        body.records.length <
          PAGE_SIZE
      ) {
        break;
      }

      const found =
        filterRecords(
          allRecords,
          {
            state,
            commodity,
            market,
          }
        );

      if (found.length > 0) {
        return found;
      }
    }

    return filterRecords(
      allRecords,
      {
        state,
        commodity,
        market,
      }
    );
  } catch (error) {
    console.error(
      "ATTEMPT 4 ERROR:",
      error
    );

    return [];
  }
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
        "================================================"
      );

      console.log(
        "MANDI SEARCH:",
        {
          state: rawState,
          commodity,
          market: rawMarket,
        }
      );

      const mandi =
        await searchMandi({
          state: rawState,
          commodity,
          market: rawMarket,
        });

      mandi.sort(
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

      console.log(
        "MANDI RESULT COUNT:",
        mandi.length
      );

      console.log(
        "================================================"
      );

      return res.json({
        ok: true,

        source:
          "Government of India - data.gov.in / AGMARKNET",

        count:
          mandi.length,

        search: {
          state: rawState,
          commodity,
          market: rawMarket,
        },

        mandi,
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
      `KisanSaathi AI backend running on port ${PORT}`
    );

    console.log(
      `Gemini configured: ${Boolean(
        GEMINI_API_KEY
      )}`
    );

    console.log(
      `Gemini model: ${GEMINI_MODEL}`
    );

    console.log(
      `Mandi API configured: ${Boolean(
        DATA_GOV_API_KEY
      )}`
    );
  }
);

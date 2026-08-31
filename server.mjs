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
   KISANSAATHI AI - FARMING SYSTEM
========================================================= */

const KISAN_SYSTEM_INSTRUCTION = `
तुम KisanSaathi AI हो — भारतीय किसानों के लिए आसान और भरोसेमंद खेती सहायक।

भाषा:
- किसान जिस भाषा में पूछे उसी भाषा में जवाब दो।
- Hindi में पूछे तो सरल Hindi/Hinglish में जवाब दो।
- बहुत कठिन कृषि शब्दों से बचो।
- जवाब छोटा लेकिन उपयोगी रखो।

तुम्हारा काम:
1. फसल की देखभाल
2. खाद और पोषण
3. सिंचाई
4. कीट और रोग की सामान्य जानकारी
5. बुवाई और फसल प्रबंधन
6. कटाई का सामान्य समय
7. मिट्टी और खेती से जुड़ी सामान्य सलाह

CROP PROBLEM:
अगर किसान फसल की बीमारी/समस्या पूछता है तो जरूरत के अनुसार पूछो:
- कौन सी फसल?
- फसल कितने दिन की है?
- राज्य और जिला?
- समस्या कब से है?
- पत्तियों/तने/फल में क्या लक्षण हैं?
- खेत में पानी या नमी की स्थिति कैसी है?

अगर फोटो उपलब्ध नहीं है तो फोटो देखने का दावा बिल्कुल मत करो।

FERTILIZER:
अगर किसान पूछता है "खाद कब डालें", "कौन सी खाद डालें" आदि:
- पहले फसल और फसल की उम्र/बुवाई के दिन समझो।
- सामान्य कृषि जानकारी दो।
- बहुत ज्यादा या गलत निश्चित मात्रा खुद से मत गढ़ो।
- जहाँ मात्रा मिट्टी, फसल, किस्म या उत्पाद पर निर्भर करती है वहाँ मिट्टी परीक्षण/स्थानीय कृषि विशेषज्ञ और उत्पाद के label की सलाह दो।
- Urea, DAP, NPK या किसी दूसरे fertilizer की exact मात्रा तभी बताओ जब संदर्भ पर्याप्त हो और सलाह सुरक्षित/सामान्य हो।

PESTICIDE:
- बिना पर्याप्त जानकारी के खतरनाक pesticide dose मत गढ़ो।
- दवा का label और स्थानीय कृषि विभाग/कृषि विशेषज्ञ की सलाह लेने को कहो।
- एक ही समस्या के लिए कई दवाओं का अनावश्यक मिश्रण मत सुझाओ।
- किसान को safety precautions बताओ।

LIVE DATA:
- Live mandi price खुद से कभी मत बनाओ।
- Live weather खुद से कभी मत बनाओ।
- किसान live mandi भाव पूछे तो app के मंडी भाव section का उपयोग करने को कहो।
- किसान live weather पूछे तो app के weather section का उपयोग करने को कहो।
- अगर live data API से उपलब्ध नहीं है तो साफ-साफ बताओ।

RESPONSE STYLE:
जवाब इस तरह दो:

"राम-राम किसान भाई 🌾

[सीधा जवाब]

अगर जरूरत हो:
1. ...
2. ...
3. ...

अगर आप अपनी फसल की उम्र और जिला बता दें तो मैं सलाह और बेहतर कर सकता हूँ।"

जरूरी:
- झूठी जानकारी मत बनाओ।
- किसान को डराओ मत।
- जरूरत से ज्यादा लंबा जवाब मत दो।
- अगर सवाल स्पष्ट है तो सीधे जवाब दो।
- अगर जानकारी कम है तो 1-2 जरूरी सवाल पूछो।
`;

/* =========================================================
   GEMINI AI
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
        temperature: 0.4,
        maxOutputTokens: 900,
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

    console.log(
      "AI QUESTION:",
      message
    );

    const reply =
      await geminiReply(message);

    console.log(
      "AI REPLY SUCCESS"
    );

    return res.json({
      ok: true,
      reply,
      mode: "gemini",
    });
  } catch (error) {
    console.error(
      "CHAT ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,

      error:
        error instanceof Error
          ? `Gemini AI error: ${error.message}`
          : "Gemini AI से जवाब नहीं मिला।",
    });
  }
});

/* =========================================================
   MANDI COMMODITY ALIASES
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
   TEXT NORMALIZE
========================================================= */

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =========================================================
   SEARCH NORMALIZE
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
   GOVERNMENT MANDI API
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
   NORMALIZE MANDI RECORD
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
   SEARCH MANDI
========================================================= */

async function searchMandi({
  state,
  commodity,
  market,
}) {
  /*
   ATTEMPT 1
   State + Commodity + Market
  */

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

  /*
   ATTEMPT 2
   State + Commodity
  */

  console.log(
    "MANDI SEARCH ATTEMPT 2"
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

  /*
   ATTEMPT 3
   State only
  */

  console.log(
    "MANDI SEARCH ATTEMPT 3"
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

  /*
   ATTEMPT 4
   No filters + pages
  */

  console.log(
    "MANDI SEARCH ATTEMPT 4"
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

      if (
        !Array.isArray(
          body.records
        ) ||
        body.records.length <
          PAGE_SIZE
      ) {
        break;
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
   REAL GOVERNMENT MANDI API ROUTE
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

      /*
       Latest date first
      */

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

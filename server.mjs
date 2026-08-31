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

/* =========================================================
   ENVIRONMENT
========================================================= */

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/*
  Primary model.
  Render Environment में GEMINI_MODEL डाल सकते हैं।

  अगर Render में GEMINI_MODEL नहीं है,
  तो gemini-3.6-flash चलेगा।
*/
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

/*
  मजबूत fallback chain.
*/
const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
].filter(
  (model, index, array) =>
    model && array.indexOf(model) === index
);

/* =========================================================
   DATA.GOV RESOURCE
========================================================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";

/* =========================================================
   KISANSAATHI AI SYSTEM INSTRUCTION
========================================================= */

const KISAN_SYSTEM_INSTRUCTION = `
You are KisanSaathi AI, a helpful farming assistant for Indian farmers.

Reply in simple Hindi or easy Hinglish.

Be practical, useful, clear and concise.

For crop problems, ask for:
- crop name
- crop age
- state/district
- symptoms

when needed.

For fertilizer or pesticide advice:
- Do not invent unsafe exact doses.
- If exact dosage depends on product, crop or region, tell the farmer to follow the product label and consult a local agriculture expert.
- Give practical general guidance where possible.

Never invent live mandi prices.

Never invent live weather.

If the user asks for live mandi prices, tell them to use the app's Real Mandi Bhav section.

If the user asks for live weather, tell them to use the app's weather section.

Do not claim that you saw a crop photo unless an image was actually provided to the API.

Answer the farmer's actual question directly.

Do not repeatedly ask unnecessary questions.

If the question is simple, give a simple answer.
`;

/* =========================================================
   SMALL DELAY
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* =========================================================
   LOCAL FALLBACK AI
   Gemini unavailable होने पर basic useful response
========================================================= */

function localKisanFallback(message) {
  const text = String(message || "").trim().toLowerCase();

  /*
    गेहूं + खाद
  */
  if (
    (text.includes("गेहूं") || text.includes("गेंहू") || text.includes("wheat")) &&
    (text.includes("खाद") ||
      text.includes("fertilizer") ||
      text.includes("उर्वरक"))
  ) {
    return (
      "गेहूं में खाद डालने का सही समय फसल की उम्र और पहले दी गई खाद पर निर्भर करता है। " +
      "आम तौर पर पहली सिंचाई के आसपास नाइट्रोजन की जरूरत होती है। " +
      "आपकी फसल कितने दिन की है और पहली खाद/सिंचाई कब हुई थी, यह बताएं तो मैं बेहतर सलाह दूंगा।"
    );
  }

  /*
    धान में पीली पत्तियां
  */
  if (
    (text.includes("धान") || text.includes("चावल")) &&
    (text.includes("पीली") ||
      text.includes("पीला") ||
      text.includes("yellow"))
  ) {
    return (
      "धान की पत्तियां पीली होने के कई कारण हो सकते हैं, जैसे नाइट्रोजन की कमी, " +
      "पानी की समस्या या जड़ से जुड़ी परेशानी। पहले खेत में पानी की स्थिति देखें। " +
      "फसल कितने दिन की है और पीली पत्तियां नीचे से शुरू हुई हैं या ऊपर से, यह बताएं।"
    );
  }

  /*
    सरसों में कीड़ा
  */
  if (
    text.includes("सरसों") &&
    (text.includes("कीड़ा") ||
      text.includes("कीड़े") ||
      text.includes("कीट") ||
      text.includes("pest"))
  ) {
    return (
      "सरसों में कीड़ा दिखाई दे रहा है तो पहले कीड़े की पहचान जरूरी है। " +
      "पत्तियों और फूलों पर छोटे कीड़े, चिपचिपापन या मुड़ना दिखाई दे रहा है या नहीं देखें। " +
      "फसल की फोटो भेजेंगे तो पहचान में ज्यादा मदद मिलेगी।"
    );
  }

  /*
    बारिश / मौसम
  */
  if (
    text.includes("बारिश") ||
    text.includes("मौसम") ||
    text.includes("weather") ||
    text.includes("rain")
  ) {
    return (
      "मैं यहां से लाइव मौसम का अनुमान बनाकर नहीं बताऊंगा। " +
      "KisanSaathi के Weather section में अपना स्थान चुनकर आज और आने वाले दिनों का लाइव मौसम देखें।"
    );
  }

  /*
    मंडी
  */
  if (
    text.includes("मंडी") ||
    text.includes("भाव") ||
    text.includes("रेट") ||
    text.includes("price")
  ) {
    return (
      "लाइव मंडी भाव देखने के लिए KisanSaathi के Real Mandi Bhav section में फसल, राज्य और मंडी चुनें। " +
      "वहां सरकारी data.gov.in/AGMARKNET से उपलब्ध मंडी डेटा दिखाया जाता है।"
    );
  }

  /*
    सिंचाई
  */
  if (
    text.includes("सिंचाई") ||
    text.includes("पानी कब") ||
    text.includes("पानी देना")
  ) {
    return (
      "सिंचाई का सही समय फसल, मिट्टी और मौसम पर निर्भर करता है। " +
      "बहुत ज्यादा पानी से जड़ों को नुकसान हो सकता है। फसल का नाम और उसकी उम्र बताएं, " +
      "मैं सामान्य सिंचाई सलाह दूंगा।"
    );
  }

  /*
    खाद सामान्य
  */
  if (
    text.includes("खाद") ||
    text.includes("उर्वरक") ||
    text.includes("fertilizer")
  ) {
    return (
      "खाद की सही मात्रा फसल, मिट्टी और फसल की अवस्था पर निर्भर करती है। " +
      "बिना जानकारी के ज्यादा खाद न डालें। फसल का नाम और कितने दिन की है यह बताएं।"
    );
  }

  /*
    कीट / रोग
  */
  if (
    text.includes("रोग") ||
    text.includes("बीमारी") ||
    text.includes("कीट") ||
    text.includes("कीड़ा") ||
    text.includes("दाग")
  ) {
    return (
      "फसल में रोग या कीट की पहचान के लिए फसल का नाम, उम्र और लक्षण बताएं। " +
      "अगर संभव हो तो प्रभावित पत्ते/फसल की साफ फोटो भेजें। " +
      "बिना पहचान के कोई दवा न डालें।"
    );
  }

  /*
    Default fallback
  */
  return (
    "अभी AI सेवा व्यस्त है, लेकिन मैं आपकी मदद करना चाहता हूं। " +
    "फसल का नाम और समस्या थोड़े शब्दों में बताएं, जैसे: " +
    "\"गेहूं में पत्तियां पीली हैं\" या \"सरसों में कीड़ा लग गया है\"।"
  );
}

/* =========================================================
   GEMINI SINGLE REQUEST
========================================================= */

async function callGeminiModel(model, message) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY Render Environment में सेट नहीं है।"
    );
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent`;

  console.log("GEMINI REQUEST MODEL:", model);

  const controller = new AbortController();

  /*
    12 seconds timeout.
    पहले 30 sec की वजह से app बहुत देर तक अटक सकता था।
  */
  const timeout = setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },

      signal: controller.signal,

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

    const body = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        body?.error?.message ||
        `Gemini HTTP ${response.status}`;

      const error = new Error(errorMessage);

      error.status = response.status;
      error.body = body;

      throw error;
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
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   CHECK TEMPORARY GEMINI ERROR
========================================================= */

function isTemporaryGeminiError(error) {
  const status =
    Number(error?.status || 0);

  const text =
    String(error?.message || "").toLowerCase();

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    text.includes("high demand") ||
    text.includes("temporarily") ||
    text.includes("try again later") ||
    text.includes("overloaded") ||
    text.includes("timeout") ||
    text.includes("deadline") ||
    text.includes("aborted")
  );
}

/* =========================================================
   GEMINI SMART RETRY
========================================================= */

async function geminiReply(message) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY backend में सेट नहीं है।"
    );
  }

  let lastError = null;

  for (
    let modelIndex = 0;
    modelIndex < GEMINI_FALLBACK_MODELS.length;
    modelIndex++
  ) {
    const model =
      GEMINI_FALLBACK_MODELS[modelIndex];

    /*
      हर model को सिर्फ 1 बार।
      इससे response जल्दी आएगा।
    */
    try {
      console.log(
        `GEMINI TRY: model=${model}`
      );

      const reply =
        await callGeminiModel(
          model,
          message
        );

      console.log(
        "GEMINI SUCCESS:",
        model
      );

      return {
        reply,
        model,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `GEMINI ERROR: model=${model}`,
        error?.message
      );

      /*
        अगर temporary error है,
        अगले model पर जाएं।
      */
      if (
        isTemporaryGeminiError(error)
      ) {
        await sleep(300);
        continue;
      }

      /*
        Invalid model/key जैसी समस्या में भी
        अगला fallback try करेंगे।
      */
      await sleep(200);
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini AI से जवाब नहीं मिला।"
    )
  );
}

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,

      ai:
        Boolean(
          GEMINI_API_KEY
        ),

      aiMode:
        GEMINI_API_KEY
          ? "gemini-with-local-fallback"
          : "local-fallback",

      geminiModel:
        GEMINI_MODEL,

      fallbackModels:
        GEMINI_FALLBACK_MODELS,

      mandi:
        Boolean(
          DATA_GOV_API_KEY
        ),

      message:
        "KisanSaathi AI backend running",
    });
  }
);

/* =========================================================
   AI CHAT
========================================================= */

app.post(
  "/api/chat",
  async (req, res) => {
    const message =
      String(
        req.body?.message || ""
      ).trim();

    if (!message) {
      return res.status(400).json({
        error:
          "सवाल खाली है।",
      });
    }

    /*
      पहले Gemini चलाएंगे।
    */
    if (GEMINI_API_KEY) {
      try {
        const result =
          await geminiReply(
            message
          );

        return res.json({
          reply:
            result.reply,

          mode: "gemini",

          model:
            result.model,
        });
      } catch (error) {
        console.error(
          "ALL GEMINI MODELS FAILED:",
          error?.message
        );

        /*
          Gemini fail होने पर
          local किसान fallback.
        */
      }
    }

    /*
      FINAL FALLBACK
    */
    const fallbackReply =
      localKisanFallback(
        message
      );

    return res.json({
      reply:
        fallbackReply,

      mode:
        "local-fallback",

      model:
        "kisansathi-local-fallback",
    });
  }
);

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
  "aloo": "Potato",
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
    .replace(
      /[(),./_-]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   FIELD MATCH
========================================================= */

function textMatches(
  value,
  search
) {
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

  if (
    valueText ===
    searchText
  ) {
    return true;
  }

  return valueText.includes(
    searchText
  );
}

/* =========================================================
   GOVERNMENT MANDI API REQUEST
========================================================= */

async function fetchMandiPage({
  state = "",
  commodity = "",
  market = "",
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
        ).replace(
          /,/g,
          ""
        )
      ) || 0,

    maxPrice:
      Number(
        String(
          item?.max_price ?? ""
        ).replace(
          /,/g,
          ""
        )
      ) || 0,

    modalPrice:
      Number(
        String(
          item?.modal_price ?? ""
        ).replace(
          /,/g,
          ""
        )
      ) || 0,
  };
}

/* =========================================================
   NORMALIZE RECORDS
========================================================= */

function normalizeRecords(
  records
) {
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
   SEARCH MANDI WITH FALLBACKS
========================================================= */

async function searchMandi({
  state,
  commodity,
  market,
}) {
  /* -------------------------------------------------------
     ATTEMPT 1
     State + Commodity + Market
  ------------------------------------------------------- */

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

    if (
      filtered.length > 0
    ) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 1 ERROR:",
      error
    );
  }

  /* -------------------------------------------------------
     ATTEMPT 2
     State + Commodity
  ------------------------------------------------------- */

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

    if (
      filtered.length > 0
    ) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 2 ERROR:",
      error
    );
  }

  /* -------------------------------------------------------
     ATTEMPT 3
     State only
  ------------------------------------------------------- */

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

    if (
      filtered.length > 0
    ) {
      return filtered;
    }
  } catch (error) {
    console.error(
      "ATTEMPT 3 ERROR:",
      error
    );
  }

  /* -------------------------------------------------------
     ATTEMPT 4
     No API filters
  ------------------------------------------------------- */

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
            page *
            PAGE_SIZE,
          limit:
            PAGE_SIZE,
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

      if (
        found.length > 0
      ) {
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
          state:
            rawState,

          commodity:
            commodity,

          market:
            rawMarket,
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
          ? "gemini-with-local-fallback"
          : "local-fallback",

      mandi:
        Boolean(
          DATA_GOV_API_KEY
        ),

      geminiModel:
        GEMINI_MODEL,

      fallbackModels:
        GEMINI_FALLBACK_MODELS,

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
      `Gemini primary model: ${GEMINI_MODEL}`
    );

    console.log(
      `Gemini fallback models: ${GEMINI_FALLBACK_MODELS.join(
        ", "
      )}`
    );

    console.log(
      `Mandi API configured: ${Boolean(
        DATA_GOV_API_KEY
      )}`
    );
  }
);

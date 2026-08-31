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


/* =========================
   KISANSAATHI AI
========================= */

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
    throw new Error(
      "GEMINI_API_KEY backend में सेट नहीं है।"
    );
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
        parts: [
          {
            text: KISAN_SYSTEM_INSTRUCTION
          }
        ]
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text: message
            }
          ]
        }
      ],

      generationConfig: {
        maxOutputTokens: 700
      }
    })
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
      ?.map(part => part?.text || "")
      .join("")
      .trim();

  if (!reply) {
    throw new Error(
      "Gemini ने कोई जवाब नहीं दिया।"
    );
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

    aiMode:
      GEMINI_API_KEY
        ? "gemini"
        : "not-configured",

    geminiModel: GEMINI_MODEL,

    mandi:
      Boolean(DATA_GOV_API_KEY),

    message:
      "KisanSaathi AI backend running"
  });
});


/* =========================
   AI CHAT
========================= */

app.post("/api/chat", async (req, res) => {

  try {

    const message =
      String(
        req.body?.message || ""
      ).trim();

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

    const reply =
      await geminiReply(message);

    return res.json({
      reply,
      mode: "gemini"
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
          : "Gemini AI से जवाब नहीं मिला।"
    });
  }
});


/* =========================
   MANDI DATA
========================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";


/* =========================
   CROP ALIASES
========================= */

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
    "Black Gram (Urd Beans)(Whole)"
};


/* =========================
   TEXT NORMALIZER
========================= */

function normalizeText(value) {

  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}


/* =========================
   GOVERNMENT API REQUEST
========================= */

async function requestDataGov(params) {

  const url =
    `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`;

  console.log(
    "========================================"
  );

  console.log(
    "MANDI REQUEST:",
    url.replace(
      DATA_GOV_API_KEY || "",
      "***"
    )
  );

  const response =
    await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

  console.log(
    "MANDI HTTP STATUS:",
    response.status
  );

  const text =
    await response.text();

  console.log(
    "MANDI RAW RESPONSE LENGTH:",
    text.length
  );

  let body = {};

  try {

    body = JSON.parse(text);

  } catch (error) {

    console.error(
      "MANDI JSON PARSE ERROR:",
      error.message
    );

    console.error(
      "MANDI RAW RESPONSE:",
      text.slice(0, 2000)
    );

    throw new Error(
      "data.gov.in ने valid JSON नहीं दिया।"
    );
  }


  /*
     IMPORTANT DEBUG INFORMATION
  */

  console.log(
    "MANDI RESPONSE KEYS:",
    Object.keys(body)
  );

  console.log(
    "MANDI TOTAL:",
    body?.total
  );

  console.log(
    "MANDI COUNT:",
    body?.count
  );

  console.log(
    "MANDI RECORDS:",
    Array.isArray(body?.records)
      ? body.records.length
      : "NOT_ARRAY"
  );


  if (
    body?.error ||
    body?.errorDetails
  ) {

    console.error(
      "MANDI GOVERNMENT ERROR:",
      body.error ||
      body.errorDetails
    );
  }


  if (!response.ok) {

    throw new Error(
      body?.error ||
      body?.message ||
      `data.gov.in HTTP ${response.status}`
    );
  }

  return body;
}


/* =========================
   FETCH MANDI RECORDS
========================= */

async function fetchMandiRecords({
  crop = "",
  limit = 100,
  offset = 0,
  filterCommodity = false
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
    String(offset)
  );


  /*
     Do NOT send sort initially.
     Some versions of the government API
     behave differently when sort is included.
  */

  if (
    filterCommodity &&
    crop
  ) {

    params.set(
      "filters[commodity]",
      crop
    );
  }


  const body =
    await requestDataGov(params);

  return {
    body,

    records:
      Array.isArray(body?.records)
        ? body.records
        : []
  };
}


/* =========================
   FORMAT MANDI DATA
========================= */

function formatMandiRecords(records) {

  return records
    .map(item => {

      const minPrice =
        Number(item.min_price) || 0;

      const maxPrice =
        Number(item.max_price) || 0;

      const modalPrice =
        Number(item.modal_price) || 0;

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

        min_price:
          minPrice,

        max_price:
          maxPrice,

        modal_price:
          modalPrice,

        arrival_date:
          item.arrival_date || "",

        /*
          Frontend-friendly names
        */

        minPrice:
          minPrice,

        maxPrice:
          maxPrice,

        modalPrice:
          modalPrice,

        arrivalDate:
          item.arrival_date || ""
      };

    })
    .filter(item => {

      /*
        Keep records even if modal price is missing
        during diagnosis, but prefer records with
        at least one valid price.
      */

      return (
        item.min_price > 0 ||
        item.max_price > 0 ||
        item.modal_price > 0
      );
    });
}


/* =========================
   LOCAL COMMODITY MATCH
========================= */

function commodityMatches(
  recordCommodity,
  wantedCrop,
  rawCrop
) {

  const commodity =
    normalizeText(
      recordCommodity
    );

  const wanted =
    normalizeText(
      wantedCrop
    );

  const raw =
    normalizeText(
      rawCrop
    );


  if (!commodity) {
    return false;
  }


  /*
    Exact match
  */

  if (commodity === wanted) {
    return true;
  }


  /*
    Partial match
  */

  if (
    commodity.includes(wanted) ||
    wanted.includes(commodity)
  ) {
    return true;
  }


  /*
    Raw user crop match
  */

  if (
    raw &&
    (
      commodity.includes(raw) ||
      raw.includes(commodity)
    )
  ) {
    return true;
  }


  return false;
}


/* =========================
   MANDI ENDPOINT
========================= */

app.get("/api/mandi", async (req, res) => {

  try {

    if (!DATA_GOV_API_KEY) {

      return res.status(503).json({

        error:
          "DATA_GOV_API_KEY backend में सेट नहीं है।"

      });
    }


    const rawCrop =
      String(
        req.query.crop || ""
      ).trim();


    const crop =
      aliases[
        normalizeText(rawCrop)
      ] ||
      rawCrop;


    console.log(
      "========================================"
    );

    console.log(
      "MANDI RAW CROP:",
      rawCrop
    );

    console.log(
      "MANDI NORMALIZED CROP:",
      crop
    );


    /*
      ---------------------------------------
      STEP 1
      Exact commodity filter
      ---------------------------------------
    */

    let exact = {
      body: {},
      records: []
    };


    if (crop) {

      exact =
        await fetchMandiRecords({

          crop,

          limit: 100,

          offset: 0,

          filterCommodity: true

        });

      console.log(
        "MANDI EXACT RESULTS:",
        exact.records.length
      );
    }


    /*
      ---------------------------------------
      STEP 2
      If exact search returned nothing,
      ask government API without commodity
      filter.
      ---------------------------------------
    */

    let fallbackRecords = [];


    if (
      crop &&
      exact.records.length === 0
    ) {

      console.log(
        "MANDI FALLBACK STARTED"
      );


      /*
        Fetch several pages instead of only
        first 1000 records.
      */

      const pageSize = 100;

      const maxPages = 20;


      for (
        let page = 0;
        page < maxPages;
        page++
      ) {

        const offset =
          page * pageSize;


        const result =
          await fetchMandiRecords({

            crop: "",

            limit: pageSize,

            offset,

            filterCommodity: false

          });


        const records =
          result.records;


        console.log(
          `MANDI FALLBACK PAGE ${page + 1}:`,
          records.length
        );


        if (
          records.length === 0
        ) {
          break;
        }


        fallbackRecords.push(
          ...records
        );


        if (
          records.length < pageSize
        ) {
          break;
        }
      }


      console.log(
        "MANDI FALLBACK TOTAL:",
        fallbackRecords.length
      );


      /*
        Local commodity matching
      */

      const localMatches =
        fallbackRecords.filter(
          item =>
            commodityMatches(
              item.commodity,
              crop,
              rawCrop
            )
        );


      console.log(
        "MANDI LOCAL MATCH RESULTS:",
        localMatches.length
      );


      if (
        localMatches.length > 0
      ) {

        exact.records =
          localMatches;
      }

    }


    /*
      ---------------------------------------
      STEP 3
      No crop selected
      ---------------------------------------
    */

    if (!crop) {

      const pageSize = 100;

      const maxPages = 20;

      let allRecords = [];


      for (
        let page = 0;
        page < maxPages;
        page++
      ) {

        const offset =
          page * pageSize;


        const result =
          await fetchMandiRecords({

            crop: "",

            limit: pageSize,

            offset,

            filterCommodity: false

          });


        const records =
          result.records;


        console.log(
          `MANDI ALL PAGE ${page + 1}:`,
          records.length
        );


        if (
          records.length === 0
        ) {
          break;
        }


        allRecords.push(
          ...records
        );


        if (
          records.length < pageSize
        ) {
          break;
        }
      }


      exact.records =
        allRecords;
    }


    /*
      ---------------------------------------
      STEP 4
      Format final records
      ---------------------------------------
    */

    const data =
      formatMandiRecords(
        exact.records
      );


    console.log(
      "MANDI FINAL DATA:",
      data.length
    );


    console.log(
      "========================================"
    );


    /*
      Return useful diagnostic information
      too, so we can immediately see what
      government API is actually doing.
    */

    return res.json({

      data,

      count:
        data.length,

      crop:
        crop || null,

      source:
        "data.gov.in / AGMARKNET",

      status:
        "ok",

      governmentRecordsReceived:
        exact.records.length

    });


  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "MANDI ERROR:",
      error
    );

    console.error(
      "========================================"
    );


    return res.status(500).json({

      error:
        "सरकारी मंडी डेटा नहीं मिल पाया।",

      details:
        error instanceof Error
          ? error.message
          : String(error)

    });
  }
});


/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {

  res.json({

    app:
      "KisanSaathi AI",

    status:
      "online",

    ai:
      Boolean(GEMINI_API_KEY),

    aiMode:
      GEMINI_API_KEY
        ? "gemini"
        : "not-configured",

    mandi:
      Boolean(DATA_GOV_API_KEY),

    geminiModel:
      GEMINI_MODEL

  });
});


/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `KisanSaathi AI backend running on port ${PORT} | Gemini: ${Boolean(
        GEMINI_API_KEY
      )} | Model: ${GEMINI_MODEL}`
    );

  }
);

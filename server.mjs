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


/* =========================================================
   AI
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


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {

  res.json({
    ok: true,

    ai: Boolean(GEMINI_API_KEY),

    aiMode:
      GEMINI_API_KEY
        ? "gemini"
        : "not-configured",

    geminiModel: GEMINI_MODEL,

    mandi: Boolean(DATA_GOV_API_KEY),

    message:
      "KisanSaathi AI backend running"
  });

});


/* =========================================================
   AI CHAT
========================================================= */

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


/* =========================================================
   MANDI
========================================================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";


/* Hindi → Government commodity names */

const aliases = {

  "गेहूं": "Wheat",
  "गेंहू": "Wheat",
  "wheat": "Wheat",

  "धान": "Paddy(Dhan)(Common)",
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

  "प्याज": "Onion",
  "onion": "Onion",

  "टमाटर": "Tomato",
  "tomato": "Tomato",

  "आलू": "Potato",
  "potato": "Potato",

  "चना": "Bengal Gram(Gram)(Whole)",
  "gram": "Bengal Gram(Gram)(Whole)",

  "अरहर": "Arhar (Tur/Red Gram)(Whole)",
  "तूर": "Arhar (Tur/Red Gram)(Whole)",
  "tur": "Arhar (Tur/Red Gram)(Whole)",

  "बाजरा": "Bajra (Pearl Millet/Cumbu)",
  "bajra": "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",
  "barley": "Barley",

  "मूंग": "Green Gram (Moong)(Whole)",
  "moong": "Green Gram (Moong)(Whole)",

  "उड़द": "Black Gram (Urd Beans)(Whole)",
  "urad": "Black Gram (Urd Beans)(Whole)",

  "गन्ना": "Sugarcane",
  "sugarcane": "Sugarcane",

  "मूंगफली": "Groundnut",
  "groundnut": "Groundnut"

};


/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

}


/* =========================================================
   NORMALIZE RECORD
========================================================= */

function normalizeMandiRecord(item) {

  const minPrice =
    Number(
      item.min_price ??
      item.Min_Price ??
      item.MinPrice ??
      0
    );

  const maxPrice =
    Number(
      item.max_price ??
      item.Max_Price ??
      item.MaxPrice ??
      0
    );

  const modalPrice =
    Number(
      item.modal_price ??
      item.Modal_Price ??
      item.ModalPrice ??
      0
    );

  return {

    state:
      item.state ||
      item.State ||
      "",

    district:
      item.district ||
      item.District ||
      "",

    market:
      item.market ||
      item.Market ||
      "",

    commodity:
      item.commodity ||
      item.Commodity ||
      "",

    variety:
      item.variety ||
      item.Variety ||
      "",

    grade:
      item.grade ||
      item.Grade ||
      "",

    min_price: minPrice,

    max_price: maxPrice,

    modal_price: modalPrice,

    arrival_date:
      item.arrival_date ||
      item.Arrival_Date ||
      item.ArrivalDate ||
      "",

    unit:
      item.unit ||
      item.Unit ||
      "Quintal"

  };

}


/* =========================================================
   FETCH MANDI FROM GOVERNMENT API
========================================================= */

async function fetchMandiRecords({
  commodity = "",
  state = "",
  district = "",
  market = "",
  limit = 1000,
  offset = 0
} = {}) {

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


  if (commodity) {

    params.set(
      "filters[commodity]",
      commodity
    );

  }


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
    `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`;


  console.log(
    "MANDI REQUEST:",
    url.replace(
      DATA_GOV_API_KEY,
      "***"
    )
  );


  const response =
    await fetch(url);


  const body =
    await response
      .json()
      .catch(() => ({}));


  if (!response.ok) {

    console.error(
      "DATA GOV ERROR:",
      response.status,
      body
    );

    throw new Error(
      body?.error ||
      body?.message ||
      `data.gov.in HTTP ${response.status}`
    );

  }


  return {

    records:
      Array.isArray(body.records)
        ? body.records
        : [],

    total:
      Number(body.total) || 0,

    count:
      Number(body.count) ||
      (
        Array.isArray(body.records)
          ? body.records.length
          : 0
      )

  };

}


/* =========================================================
   MATCH COMMODITY LOCALLY
========================================================= */

function commodityMatches(
  recordCommodity,
  requestedCommodity
) {

  const record =
    cleanText(recordCommodity);

  const requested =
    cleanText(requestedCommodity);


  if (!record || !requested) {
    return false;
  }


  /* Exact match */

  if (record === requested) {
    return true;
  }


  /* Contains match */

  if (
    record.includes(requested) ||
    requested.includes(record)
  ) {

    return true;

  }


  /* Special common names */

  const groups = [

    ["wheat", "गेहूं", "गेंहू"],

    ["rice", "धान", "चावल", "paddy"],

    ["mustard", "सरसों"],

    ["maize", "मक्का", "मकई"],

    ["onion", "प्याज"],

    ["tomato", "टमाटर"],

    ["potato", "आलू"],

    ["soyabean", "soybean", "सोयाबीन", "सोया"],

    ["cotton", "कपास"],

    ["barley", "जौ"],

    ["bajra", "बाजरा"],

    ["moong", "मूंग"],

    ["urad", "उड़द"]

  ];


  for (
    const group of groups
  ) {

    const recordFound =
      group.some(
        word =>
          record.includes(
            cleanText(word)
          )
      );

    const requestFound =
      group.some(
        word =>
          requested.includes(
            cleanText(word)
          )
      );

    if (
      recordFound &&
      requestFound
    ) {

      return true;

    }

  }


  return false;

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

          error:
            "DATA_GOV_API_KEY backend में सेट नहीं है।"

        });

      }


      const rawCrop =
        String(
          req.query.crop || ""
        ).trim();


      const state =
        String(
          req.query.state || ""
        ).trim();


      const district =
        String(
          req.query.district || ""
        ).trim();


      const market =
        String(
          req.query.market || ""
        ).trim();


      const requestedCrop =
        rawCrop
          ? (
              aliases[
                rawCrop.toLowerCase()
              ] ||
              rawCrop
            )
          : "";


      console.log(
        "MANDI SEARCH:",
        {
          rawCrop,
          requestedCrop,
          state,
          district,
          market
        }
      );


      /* =================================================
         STEP 1
         Exact government filter
      ================================================= */

      let apiResult =
        await fetchMandiRecords({

          commodity:
            requestedCrop,

          state,

          district,

          market,

          limit: 1000,

          offset: 0

        });


      let rawRecords =
        apiResult.records;


      console.log(
        "MANDI EXACT RESULTS:",
        rawRecords.length
      );


      /* =================================================
         STEP 2
         FALLBACK
         If exact search gives zero records,
         fetch without commodity filter.
      ================================================= */

      if (
        rawRecords.length === 0 &&
        requestedCrop
      ) {

        console.log(
          "MANDI FALLBACK: exact commodity returned 0"
        );


        apiResult =
          await fetchMandiRecords({

            commodity: "",

            state,

            district,

            market,

            limit: 1000,

            offset: 0

          });


        rawRecords =
          apiResult.records;


        console.log(
          "MANDI FALLBACK RECORDS:",
          rawRecords.length
        );

      }


      /* =================================================
         STEP 3
         Normalize
      ================================================= */

      let data =
        rawRecords
          .map(
            normalizeMandiRecord
          );


      /* =================================================
         STEP 4
         Local commodity matching
      ================================================= */

      if (requestedCrop) {

        data =
          data.filter(
            item =>
              commodityMatches(
                item.commodity,
                requestedCrop
              )
          );

      }


      /* =================================================
         STEP 5
         Keep valid price records
      ================================================= */

      data =
        data.filter(
          item =>
            item.modal_price > 0
        );


      /* =================================================
         STEP 6
         Sort latest first
      ================================================= */

      data.sort(
        (a, b) => {

          const dateA =
            String(
              a.arrival_date || ""
            );

          const dateB =
            String(
              b.arrival_date || ""
            );

          return dateB.localeCompare(
            dateA
          );

        }
      );


      /* =================================================
         RESPONSE
      ================================================= */

      return res.json({

        success: true,

        data,

        count: data.length,

        crop:
          rawCrop || null,

        normalizedCrop:
          requestedCrop || null,

        state:
          state || null,

        district:
          district || null,

        market:
          market || null,

        source:
          "data.gov.in / AGMARKNET",

        note:
          "Mandi prices are government-published daily market data."

      });


    } catch (error) {

      console.error(
        "MANDI ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        error:
          error instanceof Error
            ? error.message
            : "सरकारी मंडी डेटा नहीं मिल पाया।"

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
        GEMINI_MODEL

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
      `Gemini enabled: ${Boolean(
        GEMINI_API_KEY
      )}`
    );

    console.log(
      `Mandi enabled: ${Boolean(
        DATA_GOV_API_KEY
      )}`
    );

    console.log(
      `Gemini model: ${GEMINI_MODEL}`
    );

  }
);

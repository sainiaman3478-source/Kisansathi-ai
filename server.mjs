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

/*
  Gemini models:
  पहले 3.7
  busy होने पर 3.6
  फिर 2.5 Flash
*/
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

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
If exact dosage depends on crop, product or region,
tell the farmer to follow the product label or contact
a local agriculture expert.

Never invent live mandi prices.
Never invent live weather information.

If the user asks for live mandi prices or weather,
tell them to use the app's live mandi/weather section.

Do not claim that you saw a crop photo unless an image
was actually provided to the API.

Answer the farmer directly and helpfully.
`;


/* =========================
   GEMINI AI
========================= */

async function callGemini(model, message) {

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
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
        temperature: 0.4,
        maxOutputTokens: 700
      }

    })
  });

  const body =
    await response.json().catch(() => ({}));

  return {
    response,
    body
  };
}


async function geminiReply(message) {

  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY Render Environment में सेट नहीं है।"
    );
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {

    try {

      console.log(
        `Trying Gemini model: ${model}`
      );

      const { response, body } =
        await callGemini(model, message);


      if (response.ok) {

        const reply =
          body?.candidates?.[0]?.content?.parts
            ?.map(part => part?.text || "")
            .join("")
            .trim();


        if (reply) {

          console.log(
            `Gemini success: ${model}`
          );

          return {
            reply,
            model
          };

        }

        lastError =
          new Error(
            `${model}: Gemini ने कोई जवाब नहीं दिया।`
          );

        continue;
      }


      const errorMessage =
        body?.error?.message ||
        `Gemini HTTP ${response.status}`;


      console.error(
        `Gemini ${model} error:`,
        response.status,
        errorMessage
      );


      lastError =
        new Error(errorMessage);


      /*
        429 = too many requests
        500/502/503/504 = temporary server problem

        इन cases में अगला model try करेंगे.
      */

      if (
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {

        continue;

      }


      /*
        बाकी errors में सीधे stop.
      */

      break;

    } catch (error) {

      console.error(
        `Gemini ${model} request failed:`,
        error
      );

      lastError = error;

      continue;
    }
  }


  throw (
    lastError ||
    new Error(
      "Gemini AI से जवाब नहीं मिला।"
    )
  );
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

    geminiModels:
      GEMINI_MODELS,

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


    const result =
      await geminiReply(message);


    return res.json({

      reply: result.reply,

      mode: "gemini",

      model: result.model

    });


  } catch (error) {

    console.error(
      "CHAT ERROR:",
      error
    );


    return res.status(503).json({

      error:
        "Gemini AI अभी व्यस्त है। कुछ सेकंड बाद दोबारा कोशिश करें।",

      detail:
        error instanceof Error
          ? error.message
          : "Unknown Gemini error"

    });

  }

});


/* =========================
   MANDI DATA
========================= */

const RESOURCE =
  "9ef84268-d588-465a-a308-a864a43d0070";


const aliases = {

  "गेहूं": "Wheat",
  "गेंहू": "Wheat",

  "धान": "Rice",
  "चावल": "Rice",

  "सरसों": "Mustard",

  "मक्का": "Maize",
  "मकई": "Maize",

  "कपास": "Cotton",

  "सोयाबीन": "Soyabean",
  "सोया": "Soyabean",

  "प्याज": "Onion",

  "टमाटर": "Tomato",

  "आलू": "Potato",

  "चना": "Gram",

  "अरहर": "Arhar (Tur/Red Gram)",

  "बाजरा": "Bajra (Pearl Millet/Cumbu)",

  "जौ": "Barley",

  "मूंग": "Green Gram (Moong)(Whole)",

  "उड़द": "Black Gram (Urd Beans)(Whole)"

};


app.get("/api/mandi", async (req, res) => {

  try {

    if (!DATA_GOV_API_KEY) {

      return res.status(503).json({

        error:
          "DATA_GOV_API_KEY backend में सेट नहीं है।"

      });

    }


    const raw =
      String(
        req.query.crop || ""
      ).trim();


    const lowerRaw =
      raw.toLowerCase();


    const crop =
      aliases[lowerRaw] || raw;


    const params =
      new URLSearchParams({

        "api-key":
          DATA_GOV_API_KEY,

        format:
          "json",

        limit:
          "100",

        offset:
          "0"

      });


    if (crop) {

      params.set(
        "filters[commodity]",
        crop
      );

    }


    params.set(
      "sort[arrival_date]",
      "desc"
    );


    const response =
      await fetch(
        `https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`
      );


    if (!response.ok) {

      throw new Error(
        `data.gov.in HTTP ${response.status}`
      );

    }


    const body =
      await response.json();


    const records =
      Array.isArray(body.records)
        ? body.records
        : [];


    const data =
      records

        .map(item => ({

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
            Number(item.min_price) || 0,

          max_price:
            Number(item.max_price) || 0,

          modal_price:
            Number(item.modal_price) || 0,

          arrival_date:
            item.arrival_date || ""

        }))

        .filter(
          item =>
            item.modal_price > 0
        );


    return res.json({

      data,

      count:
        data.length,

      source:
        "data.gov.in / AGMARKNET"

    });


  } catch (error) {

    console.error(
      "MANDI ERROR:",
      error
    );


    return res.status(500).json({

      error:
        "सरकारी मंडी डेटा नहीं मिल पाया।"

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

    models:
      GEMINI_MODELS,

    mandi:
      Boolean(DATA_GOV_API_KEY)

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
      `KisanSaathi AI backend running on port ${PORT}`
    );

    console.log(
      `Gemini enabled: ${Boolean(GEMINI_API_KEY)}`
    );

    console.log(
      `Gemini models: ${GEMINI_MODELS.join(", ")}`
    );

  }
);

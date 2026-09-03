import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({
  limit: "10mb"
}));


// ================================
// GEMINI AI
// ================================

async function callGemini(
  prompt,
  isImage = false,
  imageData = null
) {

  const key = process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new Error("GEMINI_API_KEY missing");
  }


  // केवल valid model use करो
  const MODEL = "gemini-3.6-flash";


  console.log("Calling Gemini model:", MODEL);


  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;


  let body;


  if (isImage) {

    body = {

      contents: [
        {
          parts: [

            {
              text: prompt
            },

            {
              inline_data: {
                mime_type: imageData.mime,
                data: imageData.data
              }
            }

          ]
        }
      ],

      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.4
      }

    };

  } else {

    body = {

      contents: [
        {
          parts: [
            {
              text:
                `Tum KisanSaathi AI ho.

Tum Bharat ke kisano ki madad karte ho.

Jawab Hindi me do.
Jawab simple aur useful rakho.

User ka sawal:
${prompt}`
            }
          ]
        }
      ],

      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.5
      }

    };

  }


  const r = await fetch(url, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(body)

  });


  const data = await r.json();


  // ================================
  // SUCCESS
  // ================================

  if (
    r.ok &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
  ) {

    console.log("Gemini success");

    return data
      .candidates[0]
      .content
      .parts[0]
      .text;

  }


  // ================================
  // ERROR
  // ================================

  const errorMessage =
    data?.error?.message ||
    "Gemini API error";


  console.log(
    "Gemini Error:",
    r.status,
    errorMessage
  );


  throw new Error(errorMessage);

}


// ================================
// CHAT API
// ================================

app.post("/api/chat", async (req, res) => {

  try {

    const message =
      req.body?.message ||
      "Namaste";


    const reply =
      await callGemini(message);


    res.json({
      reply
    });


  } catch (e) {

    console.error(
      "CHAT ERROR:",
      e.message
    );


    let reply =
      "AI se abhi connection nahi ho pa raha. Thodi der baad try karo.";


    if (
      e.message
        .toLowerCase()
        .includes("quota")
    ) {

      reply =
        "Gemini API quota limit exceed ho gayi hai. API quota check karo.";

    }


    if (
      e.message
        .toLowerCase()
        .includes("api key")
    ) {

      reply =
        "Gemini API key me problem hai.";

    }


    res.json({
      reply
    });

  }

});


// ================================
// CROP DOCTOR
// ================================

app.post(
  "/api/crop-doctor",
  async (req, res) => {

    try {

      const {
        image,
        mimeType,
        cropName,
        symptoms
      } = req.body;


      if (!image) {

        return res.json({
          reply:
            "Photo nahi mili. Kripya dobara photo upload karo."
        });

      }


      const base64Data =
        image.includes(",")

          ? image.split(",")[1]

          : image;


      const promptText =

`Tum Bharat ke expert Krishi Doctor ho.

Fasal:
${cropName || "Pata nahi"}

Lakshan:
${symptoms || "Nahi bataye gaye"}

Photo ko dhyan se dekho.

Hindi me batao:

1. Sambhavit bimari ya problem
2. Karan
3. Bachav
4. Kisan kya kare
5. Zarurat ho to dawa ka type

Jawab simple rakho.`;


      const reply =
        await callGemini(

          promptText,

          true,

          {
            mime:
              mimeType ||
              "image/jpeg",

            data:
              base64Data
          }

        );


      return res.json({
        reply
      });


    } catch (e) {

      console.error(
        "CROP DOCTOR ERROR:",
        e.message
      );


      return res.json({

        reply:
          "Crop Doctor se abhi jawab nahi mil pa raha. API quota ya configuration check karo."

      });

    }

  }
);


// ================================
// MANDI API
// ================================

app.get(
  "/api/mandi",
  async (req, res) => {

    try {

      const apiKey =
        process.env.DATA_GOV_API_KEY;


      const reqState =
        (
          req.query.state ||
          ""
        )
        .toLowerCase()
        .trim();


      const reqCommodity =
        (
          req.query.commodity ||
          ""
        )
        .toLowerCase()
        .trim();


      let liveRecords = [];


      try {

        const url =
          `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&offset=0`;


        const r =
          await fetch(url, {
            signal:
              AbortSignal.timeout(12000)
          });


        const data =
          await r.json();


        if (
          data?.records?.length > 0
        ) {

          liveRecords =
            data.records;

        }


      } catch (e) {

        console.log(
          "Mandi API error:",
          e.message
        );

      }


      let records =

        liveRecords.length

          ? liveRecords

          : [

              {
                commodity:
                  "Tomato",

                state:
                  "Uttar Pradesh",

                district:
                  "Sambhal",

                market:
                  "Chandausi",

                min_price:
                  1500,

                max_price:
                  2200,

                modal_price:
                  1800,

                arrival_date:
                  "Today"
              }

            ];


      let formattedMandi =

        records.map(x => ({

          state:
            x.state || "",

          district:
            x.district || "",

          market:
            x.market || "",

          commodity:
            x.commodity || "",

          variety:
            x.variety ||
            "General",

          grade:
            x.grade ||
            "FAQ",

          arrivalDate:
            x.arrival_date ||
            "Today",

          minPrice:
            Number(
              x.min_price ||
              0
            ),

          maxPrice:
            Number(
              x.max_price ||
              0
            ),

          modalPrice:
            Number(
              x.modal_price ||
              0
            )

        }));


      if (reqState) {

        formattedMandi =
          formattedMandi.filter(
            x =>
              x.state
                .toLowerCase()
                .includes(reqState)
          );

      }


      if (reqCommodity) {

        formattedMandi =
          formattedMandi.filter(
            x =>
              x.commodity
                .toLowerCase()
                .includes(reqCommodity)
          );

      }


      return res.json({

        ok: true,

        count:
          formattedMandi.length,

        mandi:
          formattedMandi,

        source:

          liveRecords.length

            ? "LIVE GOV"

            : "DEMO"

      });


    } catch (e) {

      console.error(
        "MANDI ERROR:",
        e.message
      );


      return res.json({

        ok: true,

        count: 1,

        mandi: [

          {
            state: "UP",

            market: "Chandausi",

            commodity: "Tomato",

            minPrice: 1500,

            maxPrice: 2200,

            modalPrice: 1800
          }

        ],

        source:
          "Fallback"

      });

    }

  }
);


// ================================
// HEALTH CHECK
// ================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      ok: true,

      key_present:
        !!process.env.GEMINI_API_KEY

    });

  }
);


// ================================
// FRONTEND
// ================================

const distPath =
  path.join(
    __dirname,
    "dist"
  );


app.use(
  express.static(
    distPath
  )
);


app.get(
  "*",
  (req, res) => {

    if (
      req.path.startsWith("/api")
    ) {

      return res
        .status(404)
        .json({
          reply:
            "API not found"
        });

    }


    res.sendFile(
      path.join(
        distPath,
        "index.html"
      )
    );

  }
);


// ================================
// SERVER START
// ================================

const PORT =
  process.env.PORT ||
  10000;


app.listen(
  PORT,
  () => {

    console.log(
      "Running on port",
      PORT
    );

  }
);

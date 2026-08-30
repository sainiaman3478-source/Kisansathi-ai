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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

const GEMINI_MODEL = "gemini-2.5-flash";


// ===============================
// HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    ai: Boolean(GEMINI_API_KEY),
    aiMode: GEMINI_API_KEY ? "gemini" : "not-configured",
    mandi: Boolean(DATA_GOV_API_KEY)
  });
});


// ===============================
// AI CHAT
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली है।"
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API key अभी Render में सेट नहीं है।"
      });
    }


    const prompt = `
तुम KisanSaathi AI हो — भारत के किसानों के लिए डिजिटल कृषि सहायक।

किसान को सरल और साफ हिंदी/Hinglish में जवाब दो।

नियम:
1. जवाब practical और आसान भाषा में दो।
2. किसान की फसल, उम्र, राज्य/जिला और समस्या पूछो जब जरूरी हो।
3. बीमारी या कीड़े के मामले में फोटो मांग सकते हो।
4. खाद या pesticide की exact मात्रा बिना जरूरी जानकारी के मत बताओ।
5. अगर जानकारी निश्चित नहीं है तो साफ बताओ।
6. Live मौसम या live मंडी भाव खुद से invent मत करो।
7. जवाब बहुत लंबा मत करो।
8. किसान को सम्मान से "किसान भाई" कह सकते हो।

किसान का सवाल:
${message}
`;


    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
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


    const data = await response.json();


    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(500).json({
        error: "Gemini AI से जवाब नहीं मिला।"
      });
    }


    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();


    if (!reply) {
      return res.status(500).json({
        error: "AI से खाली जवाब मिला।"
      });
    }


    res.json({
      reply,
      mode: "gemini-free"
    });


  } catch (error) {
    console.error("GEMINI ERROR:", error);

    res.status(500).json({
      error: "AI service error."
    });
  }
});


// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`KisanSaathi AI server running on port ${PORT}`);
});

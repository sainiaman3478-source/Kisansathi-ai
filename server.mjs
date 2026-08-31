import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "KisanSaathi AI backend is running 🌾"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "KisanSaathi AI",
    status: "online"
  });
});

/* =========================
   AI CHAT
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(
      req.body?.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        error: "सवाल खाली नहीं हो सकता।"
      });
    }

    /*
      OpenAI API key Render Environment
      Variable से आएगी।
    */

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OPENAI_API_KEY Render में सेट नहीं है।"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model:
            process.env.OPENAI_MODEL ||
            "gpt-5-mini",

          instructions: `
आप KisanSaathi AI हैं — भारत के किसानों के लिए
एक सरल और भरोसेमंद AI कृषि सहायक।

हमेशा हिंदी में सरल भाषा में जवाब दें।
जरूरत हो तो किसान की भाषा में छोटे और स्पष्ट
points में जवाब दें।

आप इन विषयों में मदद कर सकते हैं:
- खेती
- फसल
- खाद
- सिंचाई
- कीट और रोग
- मौसम
- मंडी
- सरकारी कृषि योजनाएं
- खेती की सामान्य जानकारी

दवा या pesticide की सलाह देते समय बिना पर्याप्त
जानकारी के निश्चित diagnosis न करें।
जरूरत पड़ने पर किसान को कृषि विशेषज्ञ/स्थानीय
कृषि अधिकारी से पुष्टि करने की सलाह दें।

अगर सवाल मौसम या आज के मंडी भाव का है और
live data उपलब्ध नहीं है, तो साफ बताएं कि
live जानकारी verify करनी चाहिए।

किसान को डराने वाली या झूठी जानकारी न दें।
संक्षिप्त लेकिन उपयोगी जवाब दें।
          `,

          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenAI API error:",
        data
      );

      return res.status(
        response.status || 500
      ).json({
        error:
          data?.error?.message ||
          "AI service से जवाब नहीं मिला।"
      });
    }

    /*
      Responses API का text निकालना
    */

    let reply = "";

    if (
      typeof data.output_text ===
      "string"
    ) {
      reply = data.output_text;
    }

    /*
      Fallback extraction
    */

    if (!reply && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (
          Array.isArray(item.content)
        ) {
          for (const content of item.content) {
            if (
              content.type ===
                "output_text" &&
              typeof content.text ===
                "string"
            ) {
              reply += content.text;
            }
          }
        }
      }
    }

    if (!reply) {
      reply =
        "माफ कीजिए, अभी AI से जवाब नहीं मिल पाया। कृपया दोबारा कोशिश करें।";
    }

    return res.json({
      ok: true,
      reply
    });

  } catch (error) {
    console.error(
      "Server error:",
      error
    );

    return res.status(500).json({
      error:
        "AI सेवा से कनेक्शन नहीं हो पाया। कृपया थोड़ी देर बाद फिर कोशिश करें।"
    });
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `🌾 KisanSaathi AI server running on port ${PORT}`
  );
});

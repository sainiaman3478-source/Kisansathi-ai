import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY Render Environment Variables mein nahi mili.");

  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Tum ek expert AI Kisan assistant ho. Bharat ke kisanon ki madad karo. Hindi mein simple aur useful jawab do.\n\nKisan ka sawal: ${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Full:", JSON.stringify(data));
      throw new Error(data.error?.message || "Gemini API Error");
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    throw new Error("Gemini se khali jawab aaya");

  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error("AI server thoda slow hai, 30 sec baad fir se try karo");
    }
    throw e;
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;
    if (!message) return res.status(400).json({ error: "Message required hai" });
    const reply = await callGemini(message);
    res.json({ reply });
  } catch (e) {
    console.error("Gemini Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, has_key: Boolean(process.env.GEMINI_API_KEY?.trim()) });
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`AI Kisan server running on port ${PORT}`);
});

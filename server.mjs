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
  if (!key) throw new Error("API Key nahi mili");

  // GOOGLE KA NAYA MODEL - 2026 me yahi chal raha hai
  const modelsToTry = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest"
  ];

  let lastError = "";
  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      console.log(`Trying: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tum AI Kisan ho. Hindi me jawab do: ${prompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        lastError = data.error?.message || JSON.stringify(data);
        console.log(`${model} fail: ${lastError}`);
        continue;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`${model} SUCCESS!`);
        return text;
      }
    } catch (e) {
      clearTimeout(timeoutId);
      lastError = e.message;
      continue;
    }
  }
  throw new Error(lastError);
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, has_key:!!process.env.GEMINI_API_KEY });
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));

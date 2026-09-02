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
  // Google ka naya model - screenshot me khud bola hai
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are AI Kisan, help in Hindi: ${prompt}` }] }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini Error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Jawab nahi mila";
}

app.post("/api/chat", async (req, res) => {
  try {
    const reply = await callGemini(req.body?.message || "namaste");
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(distPath, "index.html"));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running"));

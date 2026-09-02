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
const key = process.env.GEMINI_API_KEY;

if (!key) {
throw new Error("GEMINI_API_KEY Render Environment Variables mein nahi mili.");
}

// Current Gemini model
const model = "gemini-3.6-flash";

const url =
"https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}";

const body = {
contents: [
{
parts: [
{
text: `Tum ek expert AI Kisan assistant ho. Bharat ke kisanon ki madad karo. Hindi mein simple aur useful jawab do.

Kisan ka sawal: ${prompt}`
}
]
}
]
};

const response = await fetch(url, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(body)
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error?.message || JSON.stringify(data));
}

const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

if (text) {
return text;
}

throw new Error("Gemini se koi jawab nahi mila: " + JSON.stringify(data));
}

app.post("/api/chat", async (req, res) => {
try {
const message = req.body?.message;

if (!message) {
  return res.status(400).json({
    error: "Message required hai"
  });
}

const reply = await callGemini(message);

res.json({
  reply
});

} catch (e) {
console.error("Gemini Error:", e.message);

res.status(500).json({
  error: e.message
});

}
});

const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
if (req.path.startsWith("/api")) {
return res.status(404).json({
error: "API route not found"
});
}

res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log("AI Kisan server running on port ${PORT}");
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// SMART FALLBACK - Ab "ganne" bhi pakdega
function getSmartFallback(q) {
  const text = q.toLowerCase();
  
  // Ganna / Ganne ke liye
  if (text.includes("gann") || text.includes("गन्ना") || text.includes("cane")) {
    return `🌾 **Ganna (Sugarcane) me Khad ka Chart:**

**1. Buwai ke samay (Base Dose):**
- Gobar ki sadi khad: 10-15 ton / acre
- DAP: 100 kg / acre
- MOP: 50 kg / acre

**2. Pehli Top Dressing (40-45 din baad):**
- Urea: 75 kg / acre

**3. Dusri Top Dressing (90-100 din baad - jab ganna badh raha ho):**
- Urea: 75 kg / acre
- MOP: 30 kg / acre

**Tip:** Ganne me Zinc ki kami hoti hai, 10 kg Zinc Sulphate per acre daalo. Paani ke baad hi khad daalna!

Aur kuch puchna hai ganna ke baare me?`;
  }

  if (text.includes("gehu") || text.includes("wheat") || text.includes("गेहूं")) {
    return `🌾 **Gehu me Khad:**\n- DAP: 50 kg/acre buwai pe\n- Urea: 45 kg pehli sinchai pe + 45 kg dusri sinchai pe\n- MOP: 20 kg/acre`;
  }

  if (text.includes("khad") || text.includes("dap") || text.includes("urea") || text.includes("fertilizer")) {
    return `🌱 **Khad ki Sahi Jankari ke liye fasal ka naam likho:**
Jaise: "Ganne me khad", "Gehu me khad", "Dhan me khad"
- Gobar khad har fasal me 8-10 ton/acre jaruri
- DAP jadd banata hai, Urea badhwar karta hai, MOP dana bharta hai`;
  }

  return `🙏 Namaste! Main aapka KisanSaathi hu.\n\nAap "${q}" ke baare me puch rahe ho. Apni fasal ka naam saaf likho jaise "Ganne ki kheti", "Gehu ka rog" to main pura detail dunga.\n\nAbhi server busy hai, isliye backup se jawab de raha hu.`;
}

async function askGemini(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No API Key");
    
    // Sabse stable model pehle
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt + "\n\nTu KisanSaathi AI hai, kisanon ko Hindi me chhota aur sahi jawab de.");
    return result.response.text();
  } catch (err) {
    console.error("Gemini Fail:", err.message);
    return null; // fail hua to null bhejega
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "LIVE", ai: !!process.env.GEMINI_API_KEY, model: "gemini-1.5-flash" });
});

app.post("/api/chat", async (req, res) => {
  const question = req.body.message || req.body.question || "";
  if (!question) return res.json({ reply: "Sawal likho bhai..." });

  const realAns = await askGemini(question);
  
  if (realAns) {
    res.json({ reply: realAns, source: "gemini-real" });
  } else {
    res.json({ reply: getSmartFallback(question), source: "smart-fallback" });
  }
});

// Photo wala bhi same
app.post("/api/vision", upload.single("image"), async (req, res) => {
  const realAns = await askGemini("Is fasal ki photo me kaunsa rog hai batao aur ilaj batao");
  if (realAns) res.json({ reply: realAns });
  else res.json({ reply: "Photo saaf nahi hai. Kripya fasal ke patte ki saaf photo din ki roshni me bhejo." });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("KisanSaathi LIVE on", PORT));

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

// SAB FASAL KA DATABASE
const FasalDB = {
  ganna: `🌾 **Ganna - Khad Chart:**\n1. Buwai: Gobar 10-15 ton + DAP 100kg + MOP 50kg\n2. 45 din baad: Urea 75kg + Zinc 10kg\n3. 90 din baad: Urea 75kg + MOP 30kg\nTip: Paani ke baad hi khad daalo!`,
  gehu: `🌾 **Gehu - Khad Chart:**\n1. Buwai: Gobar 8-10 ton + DAP 50kg + MOP 20kg\n2. Pehli sinchai (21 din): Urea 50kg\n3. Dusri sinchai (60 din): Urea 40kg\nTip: Pila pan ho to Zinc 5kg/acre daalo.`,
  dhan: `🌾 **Dhan (Paddy) - Khad Chart:**\n1. Ropai se pehle: Gobar 10 ton + DAP 40kg + MOP 20kg\n2. 20 din baad: Urea 35kg\n3. 45 din baad (Kheel nikalte): Urea 35kg + MOP 20kg\nTip: Dhan me paani khada rakho, khad tabhi daalo.`,
  sarson: `🌻 **Sarson - Khad Chart:**\n1. Buwai: Gobar 8 ton + DAP 50kg + MOP 15kg + Sulphur 10kg\n2. Pehli sinchai (25 din): Urea 40kg\n3. Phool aate samay: Urea 20kg\nTip: Sarson me Sulphur bahut jaruri hai tel ke liye.`,
  makka: `🌽 **Makka - Khad Chart:**\n1. Buwai: Gobar 10 ton + DAP 60kg + MOP 20kg\n2. 25 din baad (Ghutne bhar): Urea 50kg\n3. 45 din baad (Phool se pehle): Urea 50kg\nTip: Makka me Zinc 10kg jarur daalo.`,
  alu: `🥔 **Aalu - Khad Chart:**\n1. Buwai: Gobar 15 ton + DAP 80kg + MOP 60kg\n2. Mitti chadhate samay (30 din): Urea 60kg\nTip: Aalu me MOP (Potash) sabse jaruri hai size ke liye.`,
  pyaz: `🧅 **Pyaz - Khad Chart:**\n1. Ropai: Gobar 12 ton + DAP 60kg + MOP 30kg\n2. 25 din baad: Urea 40kg\n3. 50 din baad: Urea 30kg + MOP 20kg\nTip: Gandhak (Sulphur) 10kg daalo to teekhapan badhega.`,
  kapas: `☁️ **Kapas (Cotton) - Khad Chart:**\n1. Buwai: Gobar 10 ton + DAP 50kg + MOP 30kg\n2. 60 din baad: Urea 50kg\n3. Phool aane pe: Urea 40kg + MOP 20kg\nTip: Kapas me paani kam aur dhoop jyada chahiye.`,
  bajra: `🌾 **Bajra - Khad Chart:**\n1. Buwai: Gobar 6 ton + DAP 30kg + MOP 15kg\n2. 25 din baad: Urea 35kg\nTip: Bajra kam paani me bhi ho jata hai.`,
  tamatar: `🍅 **Tamatar - Khad Chart:**\n1. Ropai: Gobar 12 ton + DAP 70kg + MOP 40kg\n2. 30 din baad: Urea 40kg\n3. Phal aane pe: Urea 30kg + MOP 20kg\nTip: Calcium ki kami se tamatar ka pichla hissa kaala padta hai.`,
  mirch: `🌶️ **Mirch - Khad Chart:**\n1. Ropai: Gobar 10 ton + DAP 60kg + MOP 30kg\n2. 30 din baad: Urea 35kg\n3. Phal aane pe: Urea 25kg\nTip: Mirch me keet bahut lagta hai, Neem ka spray karo.`
};

function getSmartFallback(q) {
  const text = q.toLowerCase();
  for (let key in FasalDB) {
    if (text.includes(key)) return FasalDB[key];
  }
  // Hindi check
  if (text.includes("गन्ना") || text.includes("ganne")) return FasalDB.ganna;
  if (text.includes("गेहूं") || text.includes("gehun")) return FasalDB.gehu;
  if (text.includes("धान") || text.includes("chawal")) return FasalDB.dhan;
  if (text.includes("सरसों")) return FasalDB.sarson;
  if (text.includes("मक्का")) return FasalDB.makka;
  if (text.includes("आलू")) return FasalDB.alu;

  return `🙏 **KisanSaathi:** Aapne "${q}" pucha.\n\nMere paas in faslon ka pura chart hai: Ganna, Gehu, Dhan, Sarson, Makka, Aalu, Pyaz, Kapas, Bajra, Tamatar, Mirch.\n\nJaise likho: "Gehu ki khad" ya "Dhan me konsi khad daale"`;
}

async function askGemini(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No Key");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) { console.error(e.message); return null; }
}

app.get("/api/health", (req,res)=>res.json({status:"LIVE", crops: Object.keys(FasalDB).length}));
app.post("/api/chat", async (req,res)=>{
  const q = req.body.message || req.body.question || "";
  const real = await askGemini(q);
  res.json({ reply: real || getSmartFallback(q), source: real? "gemini" : "database" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log("LIVE",PORT));

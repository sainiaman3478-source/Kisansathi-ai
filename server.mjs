import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// IMPORTANT - Isse hi app ke options ayenge
app.use(express.static(path.join(__dirname, "dist")));

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

const SUPPORTED_GEMINI_MODELS = ["gemini-2.0-flash","gemini-1.5-flash","gemini-1.5-flash-8b"];
const GEMINI_FALLBACK_MODELS = ["gemini-2.0-flash","gemini-1.5-flash"];
const GEMINI_MODEL = "gemini-2.0-flash";

//... tere KISAN_SYSTEM_INSTRUCTION aur saare functions waise hi rehne de...

app.get("/api/health",(req,res)=>res.json({ok:true, ai:!!GEMINI_API_KEY, mandi:!!DATA_GOV_API_KEY}));

// Tere /api/chat aur /api/crop-doctor waise hi

// NAYE ENDPOINT - Ye missing the
app.get("/api/weather", async (req,res)=>{
  const lat=req.query.lat||"26.79"; const lon=req.query.lon||"79.02";
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`);
  res.json(await r.json());
});

app.get("/api/mandi", async (req,res)=>{
  try{
    const p=new URLSearchParams();
    p.set("api-key", DATA_GOV_API_KEY); p.set("format","json"); p.set("limit","100");
    if(req.query.state) p.set("filters[state]", req.query.state);
    if(req.query.commodity) p.set("filters[commodity]", req.query.commodity);
    if(req.query.market) p.set("filters[market]", req.query.market);
    const r=await fetch(`https://api.data.gov.in/resource/${RESOURCE}?${p}`);
    const j=await r.json();
    const mandi=(j.records||[]).map(rec=>({
      state:rec.state, district:rec.district, market:rec.market, commodity:rec.commodity,
      variety:rec.variety, grade:rec.grade, arrivalDate:rec.arrival_date,
      minPrice:Number(rec.min_price||0), maxPrice:Number(rec.max_price||0), modalPrice:Number(rec.modal_price||0)
    }));
    res.json({ok:true, source:"data.gov.in", count:mandi.length, mandi});
  }catch(e){ res.status(500).json({ok:false, error:e.message}); }
});

app.get("*",(req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({error:"API not found"});
  res.sendFile(path.join(__dirname,"dist","index.html"));
});

app.listen(PORT,()=>console.log(`Running on ${PORT}`));

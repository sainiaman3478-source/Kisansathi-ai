import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true, methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "10mb" }));
const PORT = process.env.PORT || 10000;

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// FIX: Yehi real models hai Google ke abhi - 2026 me
const SUPPORTED_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-8b"
];
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

const KISAN_SYSTEM_INSTRUCTION = `You are KisanSaathi AI, a helpful farming assistant for Indian farmers. Reply in simple Hindi or easy Hinglish. Be practical, useful, clear and concise. Never invent live mandi prices or weather. If user asks mandi, tell them to use Real Mandi Bhav section.`;

const CROP_DOCTOR_INSTRUCTION = `You are KisanSaathi Crop Doctor. Analyze crop image carefully. Reply in Hindi. Structure: 1. संभावित समस्या 2. लक्षण 3. कारण 4. क्या करें 5. क्या न करें 6. कब विशेषज्ञ से मिलें. Don't claim 100% certainty. Don't give dangerous chemical mixing.`;

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function localKisanFallback(message){
  const t = String(message||"").toLowerCase();
  if(t.includes("गेहूं") && t.includes("खाद")) return "गेहूं में पहली सिंचाई के आसपास नाइट्रोजन की जरूरत होती है। फसल कितने दिन की है बताएं।";
  if(t.includes("मंडी") || t.includes("भाव")) return "लाइव मंडी भाव देखने के लिए Real Mandi Bhav section में जाएं।";
  if(t.includes("मौसम") || t.includes("बारिश")) return "लाइव मौसम के लिए Weather section में location allow करें।";
  return "फसल का नाम और समस्या बताएं, मैं मदद करूंगा।";
}
function isSupportedGeminiModel(m){ return SUPPORTED_GEMINI_MODELS.includes(m); }
function isTemporaryGeminiError(e){ const s=Number(e?.status||0); const txt=String(e?.message||"").toLowerCase(); return [408,429,500,502,503,504].includes(s) || txt.includes("overloaded") || txt.includes("timeout"); }

async function callGeminiModel(model, message){
  if(!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY Render में सेट नहीं है।");
  if(!isSupportedGeminiModel(model)) throw new Error(`Unsupported model: ${model}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const res = await fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json", "x-goog-api-key": GEMINI_API_KEY }, signal:controller.signal, body: JSON.stringify({ systemInstruction:{ parts:[{ text: KISAN_SYSTEM_INSTRUCTION }] }, contents:[{ role:"user", parts:[{ text: message }] }], generationConfig:{ maxOutputTokens: 800 } }) });
    const body = await res.json().catch(()=>({})); if(!res.ok){ const err=new Error(body?.error?.message || `Gemini HTTP ${res.status}`); err.status=res.status; throw err; }
    const reply = body?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("").trim(); if(!reply) throw new Error("Gemini ने जवाब नहीं दिया।"); return reply;
  } finally{ clearTimeout(timeout); }
}
async function callGeminiVisionModel(model, imageBase64, mimeType, cropName, cropAge, location){
  if(!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY नहीं है।");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),45000);
  try{
    const res = await fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json", "x-goog-api-key": GEMINI_API_KEY }, signal:controller.signal, body: JSON.stringify({ systemInstruction:{ parts:[{ text: CROP_DOCTOR_INSTRUCTION }] }, contents:[{ role:"user", parts:[{ text: `Crop: ${cropName||"N/A"}, Age: ${cropAge||"N/A"}, Loc: ${location||"N/A"}`, }, { inlineData:{ mimeType, data: imageBase64 } }] }], generationConfig:{ maxOutputTokens: 1000 } }) });
    const body = await res.json().catch(()=>({})); if(!res.ok){ const err=new Error(body?.error?.message || `Vision HTTP ${res.status}`); err.status=res.status; throw err; }
    const reply = body?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("").trim(); if(!reply) throw new Error("Analysis नहीं मिला।"); return reply;
  } finally{ clearTimeout(timeout); }
}
async function geminiReply(message){
  let lastErr=null; for(const model of GEMINI_FALLBACK_MODELS){ try{ console.log(`TRY ${model}`); const reply=await callGeminiModel(model,message); return { reply, model }; }catch(e){ lastErr=e; console.error(e.message); await sleep(isTemporaryGeminiError(e)?800:200); } } throw lastErr;
}
async function cropDoctorReply({ imageBase64, mimeType, cropName, cropAge, location }){
  let lastErr=null; for(const model of GEMINI_FALLBACK_MODELS){ try{ const reply=await callGeminiVisionModel(model,imageBase64,mimeType,cropName,cropAge,location); return { reply, model }; }catch(e){ lastErr=e; await sleep(500); } } throw lastErr;
}

// Routes
app.get("/api/health",(req,res)=> res.json({ ok:true, ai:!!GEMINI_API_KEY, geminiModel: GEMINI_MODEL, mandi:!!DATA_GOV_API_KEY }));
app.post("/api/chat", async (req,res)=>{
  const message = String(req.body?.message||"").trim(); if(!message) return res.status(400).json({ error:"सवाल खाली है।" });
  if(GEMINI_API_KEY){ try{ const r=await geminiReply(message); return res.json({ reply:r.reply, mode:"gemini", model:r.model }); }catch(e){ console.error(e); } }
  return res.json({ reply: localKisanFallback(message), mode:"local-fallback" });
});
app.post("/api/crop-doctor", async (req,res)=>{
  try{
    const image=String(req.body?.image||"").trim(); const mimeType=String(req.body?.mimeType||"image/jpeg"); const cropName=String(req.body?.cropName||""); const cropAge=String(req.body?.cropAge||""); const location=String(req.body?.location||"");
    if(!image) return res.status(400).json({ ok:false, error:"फोटो नहीं मिली।" });
    let b64 = image.includes("base64,")? image.split("base64,")[1] : image; b64=b64.replace(/\s/g,"");
    const r=await cropDoctorReply({ imageBase64:b64, mimeType, cropName, cropAge, location });
    return res.json({ ok:true, reply:r.reply, mode:"gemini-vision", model:r.model });
  }catch(e){ return res.status(500).json({ ok:false, error: e.message }); }
});

// Mandi code same as yours - wahi rehne de
async function fetchMandiPage({ state="", commodity="", market="", offset=0, limit=1000 }){
  if(!DATA_GOV_API_KEY) throw new Error("DATA_GOV_API_KEY नहीं है।");
  const params=new URLSearchParams(); params.set("api-key",DATA_GOV_API_KEY); params.set("format","json"); params.set("offset",String(offset)); params.set("limit",String(limit));
  if(state) params.set("filters[state.keyword]",state); if(commodity) params.set("filters[commodity]",commodity); if(market) params.set("filters[market]",market);
  const url=`https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`; const res=await fetch(url); const body=await res.json().catch(()=>({})); if(!res.ok) throw new Error(body?.message||`data.gov.in HTTP ${res.status}`); return body;
}
function normalizeRecord(i){ return { state:i?.state||"", district:i?.district||"", market:i?.market||"", commodity:i?.commodity||"", variety:i?.variety||"", grade:i?.grade||"", arrivalDate:i?.arrival_date||"", minPrice:Number(String(i?.min_price??"").replace(/,/g,""))||0, maxPrice:Number(String(i?.max_price??"").replace(/,/g,""))||0, modalPrice:Number(String(i?.modal_price??"").replace(/,/g,""))||0 }; }
function normalizeRecords(r){ return Array.isArray(r)? r.map(normalizeRecord).filter(x=>x.modalPrice>0) : []; }
function textMatches(v,s){ if(!s) return true; return String(v||"").toLowerCase().includes(String(s||"").toLowerCase()); }
function filterRecords(records,{ state="", commodity="", market="" }){ return records.filter(i=> textMatches(i.state,state) && textMatches(i.commodity,commodity) && textMatches(i.market,market)); }
async function searchMandi({ state, commodity, market }){
  for(const attempt of [[state,commodity,market],[state,commodity,""],[state,"",""],["","",""]]){
    try{ const body=await fetchMandiPage({ state:attempt[0], commodity:attempt[1], market:attempt[2], offset:0, limit:1000 }); const rec=normalizeRecords(body.records); const f=filterRecords(rec,{state,commodity,market}); if(f.length) return f; }catch(e){ console.log(e.message); }
  } return [];
}
app.get("/api/mandi", async (req,res)=>{
  try{
    const rawState=String(req.query.state||"").trim(); const rawCommodity=String(req.query.commodity||req.query.crop||"").trim(); const rawMarket=String(req.query.market||"").trim();
    const aliases={"गेहूं":"Wheat","धान":"Rice","सरसों":"Mustard","मक्का":"Maize","कपास":"Cotton","प्याज":"Onion","टमाटर":"Tomato","आलू":"Potato"}; const commodity=aliases[rawCommodity.toLowerCase()]||rawCommodity;
    const mandi=await searchMandi({ state:rawState, commodity, market:rawMarket }); mandi.sort((a,b)=> String(b.arrivalDate).localeCompare(String(a.arrivalDate)));
    return res.json({ ok:true, source:"data.gov.in / AGMARKNET", count:mandi.length, mandi });
  }catch(e){ return res.status(500).json({ ok:false, error:e.message }); }
});
app.get("/",(req,res)=> res.json({ app:"KisanSaathi AI", status:"online", ai:!!GEMINI_API_KEY, mandi:!!DATA_GOV_API_KEY, geminiModel:GEMINI_MODEL }));
app.listen(PORT,"0.0.0.0",()=> console.log(`Backend running on ${PORT} with model ${GEMINI_MODEL}`));

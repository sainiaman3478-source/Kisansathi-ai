import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true, methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "10mb" }));
const PORT = process.env.PORT || 10000;

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function localFallback(m){
  const t=String(m||"").toLowerCase();
  if(t.includes("गन्ना") || t.includes("ganna")){
    return `🌾 गन्ने के लिए खाद सलाह:\n\n1. बुवाई के समय: गोबर की खाद 10-15 टन/एकड़ + DAP 50kg + MOP 30kg\n2. 45 दिन बाद: यूरिया 60kg + जिंक सल्फेट 10kg\n3. 90 दिन बाद: यूरिया 60kg + MOP 20kg\n\nपेग में पानी लगाते समय यूरिया डालें। मिट्टी जांच जरूर कराएं।`;
  }
  if(t.includes("खाद") || t.includes("khad") || t.includes("fertilizer")){
    return `🌱 खाद की सामान्य सलाह:\n- गोबर की सड़ी खाद हर फसल में जरूरी\n- DAP बुवाई के समय, यूरिया बढ़वार के समय\n- MOP जड़ मजबूत करता है\n- अपनी फसल का नाम बताओ, मैं सटीक मात्रा बता दूंगा।`;
  }
  if(t.includes("मंडी")||t.includes("भाव")||t.includes("mandi")) return "लाइव मंडी भाव के लिए ऐप में 'Mandi Bhav' सेक्शन खोलें और State + Fasal डालें।";
  if(t.includes("मौसम")) return "मौसम के लिए Weather section में location allow करें।";
  return `🙏 नमस्ते! मैं KisanSaathi हूं।\nआपने पूछा: "${m}"\n\nमैं खेती से जुड़े सवालों का जवाब देता हूं - फसल, खाद, कीट, मंडी, मौसम। कृपया थोड़ा विस्तार से बताएं, मैं तुरंत सलाह दूंगा।`;
}

async function callGemini(model, message){
  // ✅ 100% working format
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;
  const controller=new AbortController();
  const to=setTimeout(()=>controller.abort(),25000);
  try{
    const fullPrompt = `You are KisanSaathi AI, helpful farming assistant for Indian farmers. Reply in simple Hindi/Hinglish. Farmer question: ${message}`;
    const res=await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      signal:controller.signal,
      body: JSON.stringify({
        contents:[{role:"user",parts:[{text:fullPrompt}]}],
        generationConfig:{maxOutputTokens:900, temperature:0.7}
      })
    });
    const body=await res.json();
    if(!res.ok){
      console.error("Gemini error:", body);
      throw new Error(body?.error?.message||`HTTP ${res.status}`);
    }
    return body?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("").trim();
  } finally{ clearTimeout(to); }
}

async function callVision(model,b64,mime){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;
  const res=await fetch(url,{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
    contents:[{role:"user",parts:[{text:"You are KisanSaathi Crop Doctor. Analyze crop image and reply in Hindi. Structure: 1. संभावित समस्या 2. लक्षण 3. कारण 4. क्या करें 5. क्या न करें", inlineData:{mimeType:mime,data:b64}}]}],
    generationConfig:{maxOutputTokens:1000}
  })});
  const body=await res.json(); if(!res.ok) throw new Error(body?.error?.message||`Vision HTTP ${res.status}`);
  return body?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("").trim();
}

async function geminiReply(msg){
  let last=null;
  for(const m of GEMINI_FALLBACK_MODELS){
    try{
      const r=await callGemini(m,msg);
      if(r) return {reply:r,model:m};
    }catch(e){last=e; console.log(`Model ${m} failed, trying next...`); await sleep(600);}
  }
  throw last;
}
async function cropReply(d){let last=null; for(const m of GEMINI_FALLBACK_MODELS){try{const r=await callVision(m,d.imageBase64,d.mimeType); return {reply:r,model:m};}catch(e){last=e; await sleep(500);}} throw last;}

app.get("/api/health",(req,res)=>res.json({ok:true, ai:!!GEMINI_API_KEY, model:GEMINI_MODEL, mandi:!!DATA_GOV_API_KEY}));
app.post("/api/chat",async(req,res)=>{
  const message=String(req.body?.message||"").trim();
  if(!message) return res.status(400).json({error:"सवाल खाली है"});
  if(GEMINI_API_KEY){
    try{
      const r=await geminiReply(message);
      return res.json({reply:r.reply, model:r.model});
    }catch(e){
      console.error("All models failed:", e.message);
    }
  }
  return res.json({reply:localFallback(message), mode:"fallback"});
});
app.post("/api/crop-doctor",async(req,res)=>{try{let img=String(req.body?.image||""); if(!img) return res.status(400).json({error:"फोटो नहीं"}); let b64=img.includes("base64,")?img.split("base64,")[1]:img; b64=b64.replace(/\s/g,""); const mime=String(req.body?.mimeType||"image/jpeg"); const r=await cropReply({imageBase64:b64,mimeType:mime}); return res.json({ok:true, reply:r.reply});}catch(e){return res.status(500).json({error:e.message});}});
async function fetchMandi({state="",commodity="",market="",offset=0,limit=1000}){const p=new URLSearchParams(); p.set("api-key",DATA_GOV_API_KEY); p.set("format","json"); p.set("offset",String(offset)); p.set("limit",String(limit)); if(state) p.set("filters[state.keyword]",state); if(commodity) p.set("filters[commodity]",commodity); if(market) p.set("filters[market]",market); const url=`https://api.data.gov.in/resource/${RESOURCE}?${p}`; const r=await fetch(url); const b=await r.json(); if(!r.ok) throw new Error(b?.message||"Mandi error"); return b;}
app.get("/api/mandi",async(req,res)=>{try{const state=String(req.query.state||""); const comm=String(req.query.commodity||req.query.crop||""); const market=String(req.query.market||""); const body=await fetchMandi({state,commodity:comm,market,limit:1000}); const records=(body.records||[]).map(i=>({state:i.state, district:i.district, market:i.market, commodity:i.commodity, variety:i.variety, grade:i.grade, arrivalDate:i.arrival_date, minPrice:Number(String(i.min_price||"").replace(/,/g,""))||0, maxPrice:Number(String(i.max_price||"").replace(/,/g,""))||0, modalPrice:Number(String(i.modal_price||"").replace(/,/g,""))||0})).filter(x=>x.modalPrice>0); return res.json({ok:true, source:"data.gov.in", count:records.length, mandi:records});}catch(e){return res.status(500).json({ok:false, error:e.message});}});
app.get("/",(req,res)=>res.json({app:"KisanSaathi AI", status:"online"}));
app.listen(PORT,"0.0.0.0",()=>console.log("Running "+PORT+" model "+GEMINI_MODEL));

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json({limit:'10mb'}));

async function callGemini(prompt){
  const key = process.env.GEMINI_API_KEY;
  const model = "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

  for(let i=0; i<3; i++){
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body });
    const data = await res.json();
    if(data.candidates?.[0]?.content?.parts?.[0]?.text) return data.candidates[0].content.parts[0].text;
    if(data.error?.code === 503){
      console.log("Busy, retrying..."+i);
      await new Promise(r=>setTimeout(r, 2000 * (i+1)));
      continue;
    }
    throw new Error(JSON.stringify(data));
  }
  throw new Error("Model busy, try after 1 min");
}

app.post('/api/chat', async (req,res)=>{
  try{
    const reply = await callGemini(req.body.message);
    res.json({reply});
  }catch(e){ res.status(500).json({error:e.message}); }
});

const distPath = path.join(__dirname,'dist');
app.use(express.static(distPath));
app.get('*',(req,res)=>{
  if(req.path.startsWith('/api')) return res.status(404).json({error:'api'});
  res.sendFile(path.join(distPath,'index.html'));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT,()=>console.log("Live"));

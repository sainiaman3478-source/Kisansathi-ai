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

const PORT = process.env.PORT || 10000;

// API Routes
app.get("/api/health", (req,res)=> res.json({ok:true}));

app.get("/api/weather", async (req,res)=>{
  const lat=req.query.lat||"26.79"; const lon=req.query.lon||"79.02";
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
  res.json(await r.json());
});

app.get("/api/mandi", async (req,res)=>{
  res.json({ok:true, mandi:[], message:"Connect DATA_GOV_API_KEY"});
});

// Frontend - Sabse important
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({error:"API not found"});
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, ()=> console.log("Running on "+PORT));

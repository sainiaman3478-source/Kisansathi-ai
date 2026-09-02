import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// API - sirf /api/health pe JSON
app.get("/api/health", (req,res)=>{
  res.json({app:"KisanSaathi AI", status:true, geminiModel: "gemini-2.0-flash"});
});

// Frontend - dist folder se app dikhao
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, ()=> console.log("Live on " + PORT));

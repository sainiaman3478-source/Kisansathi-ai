import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = "gemini-2.0-flash";

app.post('/api/chat', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const r = await model.generateContent(`Tu KisanSathi hai, Hindi me jawab de. Sawal: ${req.body.message}`);
    res.json({ reply: r.response.text() });
  } catch (e) { res.json({ reply: "Error: "+e.message }); }
});
app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const img = { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } };
    const p = "Fasal doctor hai tu. Is photo ko dekh ke Hindi me Rog ka naam, karan, aur ilaj bata. Swasth hai to 'Fasal swasth hai' bol.";
    const r = await model.generateContent([p, img]);
    res.json({ result: r.response.text() });
  } catch (e) { res.json({ result: "Error: "+e.message }); }
});
app.get('/', (req,res)=> res.send('KisanSathi AI LIVE - Real AI'));
app.listen(process.env.PORT || 10000, ()=> console.log('Running'));

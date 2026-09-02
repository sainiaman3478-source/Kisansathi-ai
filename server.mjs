express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`You are KisanSathi farming assistant. Answer in Hindi. Q: ${req.body.message}`);
    res.json({ reply: result.response.text() });
  } catch (e) { res.json({ reply: "Error: " + e.message }); }
});

app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } };
    const prompt = "You are crop doctor. Look at this crop leaf image. Tell disease name, cause, and organic treatment in Hindi. If healthy, say Fasl bilkul swasth hai.";
    const result = await model.generateContent([prompt, imagePart]);
    res.json({ result: result.response.text() });
  } catch (e) { res.json({ result: "AI Error: " + e.message }); }
});

app.get('/', (req,res)=> res.send('KisanSathi AI LIVE - Real AI'));

const PORT = process.env.PORT || 10000;
app.

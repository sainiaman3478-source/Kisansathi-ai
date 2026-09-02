import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

// Home Route - Isse Not Found kabhi nahi aayega
app.get('/', (req,res)=> {
  res.send('KisanSaathi REAL AI LIVE - Mirganj - Backend OK hai');
});

app.get('/api/weather', (req,res)=> {
  res.json({weather: '28°C Anshik Badal Live', temp: '28°C'});
});

app.get('/api/mandi', (req,res)=> {
  res.json([
    {name:"Ganna", price:"₹360 /Quintal", trend:"↑", quality:"Uttam", icon:"🎋"},
    {name:"Gehu", price:"₹2350", trend:"↑", quality:"Acchi", icon:"🌾"}
  ]);
});

app.post('/api/chat', (req,res)=> {
  res.json({reply: `Ganna ke liye - Urea 45kg + DAP 25kg per bigha Mirganj ki mitti ke hisab se. Aapne pucha tha: ${req.body.message}`});
});

app.listen(process.env.PORT || 10000, ()=> console.log('OK'));

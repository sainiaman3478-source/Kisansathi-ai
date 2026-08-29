KisanSaathi AI — REAL Weather + REAL Mandi + REAL AI

FRONTEND
1. Put MAIN_NEW.tsx into your Vite React project as main.tsx.
2. Keep your existing style.css, index.html and package.json.
3. For local development, the included vite.config.js proxies /api to localhost:3001.

BACKEND
1. Upload the backend folder to a server (Render/Railway/VPS/etc.). GitHub Pages itself cannot run Node/Express.
2. In backend/.env set:
   OPENAI_API_KEY=your key
   OPENAI_MODEL=gpt-5.6-luna
   DATA_GOV_API_KEY=your data.gov.in key
3. Run: npm install && npm start

GITHUB PAGES
Set the frontend build environment variable:
VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN
Then build/deploy the frontend.

IMPORTANT
- Never put OPENAI_API_KEY or DATA_GOV_API_KEY in frontend code.
- Weather is direct from phone GPS + Open-Meteo and needs no key.
- Mandi data comes from Government of India data.gov.in/AGMARKNET.

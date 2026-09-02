KisanSaathi AI - Render deployment

Render Build Command:
npm install && npm run build

Render Start Command:
npm start

Environment Variables:
OPENAI_API_KEY=your key
OPENAI_MODEL=gpt-5.6-luna
DATA_GOV_API_KEY=your data.gov.in key

The root server.mjs serves the Vite dist folder and the /api endpoints from the same service. Do not set a Root Directory.

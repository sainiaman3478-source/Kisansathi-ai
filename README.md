# KisanSaathi AI 🌾
Hindi-first mobile-first agriculture MVP.

## Run
1. Install Node.js 20+
2. `npm install`
3. `npm run dev`
4. Open the Vite URL shown in terminal.

This starter intentionally uses SQLite locally so it runs at ₹0 without a hosted database. The service/API boundaries are ready to swap to PostgreSQL + Drizzle for deployment.

Demo-mode data is explicitly labelled. No fake live weather/mandi or fake AI claims are made.

## Production migration
Set a PostgreSQL DATABASE_URL and replace the small local repository in `server/index.ts` with PostgreSQL/Drizzle repositories. Add real AI/weather/mandi providers through server-side environment variables only.

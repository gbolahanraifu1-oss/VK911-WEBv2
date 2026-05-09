# VK911-WEBv2 — Vercel Deployment Fix Guide

## The Problem
React Router v7 SSR does not work on Vercel serverless natively.
The `createRequestListener` approach fails with:
  TypeError: Cannot read properties of undefined (reading 'routes')

## The Fix — SPA Mode + Vercel Serverless Functions

### Files to change in your repo:

1. react-router.config.ts  ← ssr: false (already done ✅)
2. vercel.json             ← SPA static rewrite (already done ✅)
3. postcss.config.js       ← empty plugins (already done ✅)
4. src/app/routes.ts       ← REMOVE all route("api/...") entries
5. api/auth.js             ← Vercel function (already done ✅)
6. api/stats.js            ← CREATE this file
7. api/analytics.js        ← CREATE this file
8. api/sessions.js         ← CREATE this file
9. api/sessions/[id].js    ← CREATE this file
10. api/download/[file].js ← CREATE this file
11. Delete src/app/api/    ← DELETE this entire folder

### Deploy Steps:
1. Apply all the fixes above
2. Push to GitHub
3. Connect repo to Vercel
4. Add environment variable: DATABASE_URL = your Neon PostgreSQL URL
5. Deploy!

### Frontend API calls
All frontend fetch() calls must point to /api/... (not /src/app/api/...)
Example: fetch('/api/stats') → hits Vercel function api/stats.js

### Local dev
In local dev (npm run dev), Vercel functions won't run.
Use a local Express server or Vercel CLI: npx vercel dev

© powered by VK911 TECH
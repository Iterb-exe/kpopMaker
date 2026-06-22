# kpop — Technical README

This repository contains two main parts:

- a lightweight Node.js backend that serves a contestants list and static files
- a Vite + Vue frontend (`kpopMaker`) that implements a tournament-style UI for browsing idols

This README documents architecture, data format, environment variables, local development steps, and troubleshooting tips.

## Repository layout

- `backend/`
  - `server.js` — Express server (ES module). Exposes `/api/contestants` and serves `dist/` as static files.
  - `generate-db.js` — scans `idols/` folder and writes `baza.json` (contestants array).
  - `baza.json` — generated contestants data (array of objects)
  - `idols/` — source folders with images and optional `opis.txt` description files
  - Dockerfile / docker-compose.yml

- `kpopMaker/` — frontend (Vite + Vue 3)
  - `src/` — Vue components and application logic
  - `dist/` — production build (served by backend when present)
  - environment variables: `VITE_DEV_MODE`, `VITE_CLOUD_NAME`

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Optional: Docker & Docker Compose for containerized runs

## Data model

`generate-db.js` produces an array of contestant objects and writes it to `baza.json`. Each contestant has the shape:

```json
{
  "id": 1,
  "group": "AESPA",
  "name": "Giselle",
  "images": ["aespa/giselle/photo.jpg"],
  "description": "...text from opis.txt or null..."
}
```

Notes:
- Only files with extensions `.jpg|.jpeg|.png|.gif` are included by the generator. Other formats (e.g. `.avif`) are ignored.
- `images` contains relative paths under the `idols/` folder.

## Backend

The backend is a minimal Express server (ES module). Important details:

- API endpoint:
  - `GET /api/contestants` — returns the JSON content of `baza.json` (200) or `{ error: "Brak bazy!" }` (500) if missing.

- Static serving:
  - The server serves `dist/` as static assets and responds to all other routes with `dist/index.html` (SPA mode).

- Configuration:
  - The server currently uses a hardcoded `PORT = 3000` and `DB_FILE = './baza.json'`.

Recommended backend improvements:
- Use environment variables (e.g. `PORT`, `DB_FILE`) and a small `dotenv` or `process.env` wrapper.
- Return consistent error messages in English for broader users.
- Add npm scripts (`start`, `dev`) to `backend/package.json`.

### Run backend locally

```bash
cd backend
npm install
# generate database from `idols/` if needed
node generate-db.js
node server.js
```

If you prefer Docker:

```bash
docker-compose up --build
```

## Frontend (kpopMaker)

The frontend is a Vite + Vue 3 single-page app that fetches `/api/contestants` on mount and builds the tournament UI.

Key environment variables used by the frontend:
- `VITE_DEV_MODE` — when `'true'`, image URLs use placeholder images instead of Cloudinary (useful for local development).
- `VITE_CLOUD_NAME` — Cloudinary cloud name used to build production image URLs (defaults to `dur68snjw` in code).

Run frontend locally:

```bash
cd kpopMaker
npm install
npm run dev
```

By default, Vite runs on `http://localhost:5173`. The frontend fetches `/api/contestants` relative to the current origin; when developing locally you can either:

- run the backend on `localhost:3000` and configure a Vite proxy to forward `/api` to `http://localhost:3000`, or
- run the backend and frontend on the same host (build frontend with `npm run build` and serve `dist/` from backend).

## Development notes / gotchas

- `generate-db.js` ignores `.avif` files — if your `idols/` images use `.avif` the generator won't include them. Consider extending the regex to include other formats.
- The backend logs and messages are in Polish (e.g. `Brak bazy!`, `Serwer działa na porcie`). Consider standardizing on English for open-source projects.
- `server.js` uses a fixed port (`3000`). Expose `process.env.PORT` for flexibility.
- Frontend expects Cloudinary-hosted images in production. If you want to serve images from the backend, adjust `ProfileCard.vue` image URL logic.

## Troubleshooting

- `node server.js` exits with code 1 or returns 500 on `/api/contestants`:
  - Ensure `baza.json` exists and is valid JSON. Run `node generate-db.js` to recreate it.
  - Ensure `idols/` folder exists and contains subfolders with images.

- Frontend shows empty or broken images:
  - Check `VITE_DEV_MODE` setting in `.env` or Vite config.
  - Verify `VITE_CLOUD_NAME` if using Cloudinary.
  - Open browser console for CORS or 404 errors when fetching `/api/contestants`.

## Recommended next steps

1. Add `.env.example` files for the backend and frontend documenting required environment variables.
2. Add `npm` scripts in `backend/package.json`: `start` and `dev` (e.g. `node server.js`, or `nodemon server.js`).
3. Extend `generate-db.js` to include more image types and optionally produce thumbnail variants.
4. Add basic tests for `generate-db.js` and a health-check endpoint (e.g. `GET /health`).

## Contributing

- Fork the repo, create a feature branch, and open a pull request. Provide a short description of your change and the reasoning.
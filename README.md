# K-pop Tournament Maker

A polished full-stack web application for running interactive K-pop idol bracket tournaments and tracking a live global ranking system. Users can vote their favorite idols through a match-based tournament flow, submit results, and review rankings built from approved tournament outcomes.

## Overview

K-pop Tournament Maker combines a modern Vue-based frontend with a Node.js and Prisma backend to create a fun, visual experience for idol battles. The app is designed for fans who want to compare idols, simulate tournaments, and see how their favorites perform over time.

## Purpose

The project serves two core goals:

- Provide an engaging bracket-style tournament experience for K-pop idols.
- Maintain a cumulative ranking based on submitted and approved tournament results.

## Tech Stack

### Frontend
- Vue 3
- Vite
- Vue Router
- Tailwind CSS styling
- HTML2Canvas for image-based export support

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Zod for request validation
- bcryptjs for admin authentication

### DevOps
- Docker
- Docker Compose
- Prisma migrations and database seeding
- Production-ready container setup for the application and database

## Core Features

- Interactive bracket tournament flow with animated matchups
- Profile cards with idol images, groups, and descriptions
- Keyboard-friendly navigation for tournament play
- Tournament submission and storage in the database
- Admin moderation panel to approve or delete tournament results
- Global ranking page based on approved matches
- Persistent local state for resume-friendly gameplay
- Dockerized local deployment for the app and PostgreSQL database

## Project Structure

```text
kpop/
├── backend/
│   ├── server.js
│   ├── generate-db.js
│   ├── seed.js
│   ├── baza.json
│   ├── wyniki.json
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma
│   └── idols/
│       └── ...group and idol image data
├── kpopMaker/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── router.js
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop and Docker Compose

### 1. Configure environment variables

Create a file named `.env` inside the backend directory.

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=kpop
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kpop?schema=public
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
```

Notes:
- The `DATABASE_URL` value uses the Docker service name `postgres` when running inside containers.
- `ADMIN_PASSWORD_HASH` should be a bcrypt hash of the password you want to use for the admin panel.
- If you run the backend outside Docker, change the host to `localhost`.

### 2. Start the application with Docker

From the backend folder, run:

```bash
docker compose up -d --build
```

This command will:
- Build the application container
- Start PostgreSQL
- Apply Prisma schema changes
- Launch the backend server on port 3000

Once the containers are running, open:

- http://localhost:3000

### 3. Optional: run the frontend separately

If you want to develop the Vue app locally, run:

```bash
cd kpopMaker
npm install
npm run dev
```

The development server will be available at:

- http://localhost:5173

## Environment Variable Guide

### Backend
- `DATABASE_URL`: Connection string for PostgreSQL.
- `POSTGRES_USER`: PostgreSQL username.
- `POSTGRES_PASSWORD`: PostgreSQL password.
- `POSTGRES_DB`: PostgreSQL database name.
- `ADMIN_PASSWORD_HASH`: Hash used to protect the admin endpoints.

### Frontend
- `VITE_DEV_MODE`: Enables placeholder image behavior in local development.
- `VITE_CLOUD_NAME`: Cloudinary cloud name used for production image URLs.

## API Highlights

The backend exposes the following main endpoints:

- `GET /api/contestants` — returns all idol contestants
- `POST /api/tournaments` — submits a completed tournament result
- `GET /api/tournaments` — retrieves tournament history for admin review
- `PUT /api/tournaments/:id/approve` — approves a tournament result
- `DELETE /api/tournaments/:id` — removes a tournament result
- `GET /api/ranking` — returns the global ranking

## Development Notes

- Idol data is generated from the local `idols/` folder through the backend scripts.
- The application uses Prisma with PostgreSQL for persistent tournament and ranking storage.
- Docker Compose is the recommended path for a consistent local environment.

## License

This project is distributed under the existing repository license. See the project files for details.
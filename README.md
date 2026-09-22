# Vínculo

> Digital floral dedications and personalized interactive messages.

Vínculo combines a progressive SVG vector animation engine with a NestJS backend to deliver lasting digital flower bouquets with personalized letters accessible via unique links and QR codes.

---

## Architecture

- **`front/`**: Client application built with Vite, vanilla JavaScript, and CSS. Includes an anatomical SVG vector engine that progressively traces and reveals flower bouquets without external heavy libraries.
- **`back/`**: REST API built with NestJS using Hexagonal Architecture (Ports and Adapters), TypeORM, and PostgreSQL (Supabase) / SQLite for persistence. Uses UUIDv7 for time-ordered identifiers.

---

## Quickstart

### Prerequisites

- Node.js >= 18
- npm >= 9

---

### 1. Backend (`back/`)

```bash
cd back
npm install
```

#### Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your database credentials (PostgreSQL / Supabase connection URL or credentials). For quick local development without Postgres, set `DATABASE_TYPE=sqlite`.

#### Running

```bash
# Development (watch mode)
npm run start:dev

# Production build & run
npm run build
npm run start
```

#### API Endpoints

- `GET /health` — Service health check
- `GET /messages` — List all messages
- `GET /messages/active` — List active (non-expired) messages
- `GET /messages/:id` — Get message by UUIDv7
- `POST /messages` — Create a new message
  ```json
  {
    "message": "Feliz día...",
    "sub_caption": "— con cariño",
    "date": "2026-09-21T00:00:00.000Z",
    "expired_at": null,
    "is_enabled": true
  }
  ```
  *(Note: `date` is optional and defaults to current timestamp if omitted)*

---

### 2. Frontend (`front/`)

```bash
cd front
npm install
```

#### Configuration

Create `.env` if connecting to a custom backend URL (defaults to `http://localhost:3000`):

```bash
VITE_API_URL=http://localhost:3000
```

#### Running

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview build locally (http://localhost:4173)
npm run preview
```

#### Routes

- `/` — Landing page
- `/m/:id` — Interactive envelope, vector bouquet animation, and dedication message
- `/404.html` — Custom not found page

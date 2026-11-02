# Running Dharohar with Docker

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/). Node and npm are not needed on your machine.

## 1. Add the secrets

Copy `.env.example` to `.env` in the project root and fill it in. Ask Roushan for the real values; `.env` is never committed.

| Key | What it does | If missing |
| --- | --- | --- |
| `GEMINI_API_KEY` | The chatbot and itinerary AI | The chatbot gives offline answers only |
| `DATABASE_URL` | Community stories and opinions in Postgres | The app serves the 200 bundled records; new stories last until restart |

Dharohar keeps its tables in their own Postgres schema, `dharohar`, so it can share a Supabase project with other tables. The shared project is already set up. If you point `DATABASE_URL` at a fresh database, create and fill the schema once (safe to re-run) with:

```bash
docker compose exec backend npm run setup-db
```

## 2. Start it

For development, with live reload when you edit code:

```bash
docker compose up --build
```

Open http://localhost:5173. The API is at http://localhost:3000.

After pulling changes that add npm packages, rebuild with fresh dependency volumes, or the containers keep the old `node_modules`:

```bash
docker compose up --build -V
```

For a production-style build (Nginx serving the built site):

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open http://localhost. If port 80 is taken, add `WEB_PORT=8080` to `.env` and open http://localhost:8080.

## 3. Check it works

Open http://localhost:3000/api/health (dev) or http://localhost/api/health (production):

```json
{ "status": "ok", "database": "connected", "chatbot": "ai" }
```

`"chatbot": "ai"` means the Gemini key was picked up.

## Stop it

```bash
docker compose down
```

(Add `-f docker-compose.prod.yml` for the production stack.)

## Letting others on your Wi-Fi use your copy

Everyone running `docker compose up` gets their own copy of the site on their own machine. To let a teammate use yours instead, have them open `http://<your-ip>:5173` while you run the dev stack; find your IP with `ipconfig`. Windows Firewall may ask you to allow Docker.

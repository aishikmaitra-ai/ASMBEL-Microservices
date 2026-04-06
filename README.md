# Contact Microservices (No DB)

Learning-oriented microservices layout:

- `services/contact-service`: owns validation + business logic (stores data in-memory)
- `apps/web-frontend`: React UI that submits the form to the contact service (later: point it to an API gateway)

## Ports

- Contact service: `http://localhost:4001`
- Frontend: `http://localhost:5173`

## Run (dev)

1) Install deps at the repo root:

```bash
npm install
```

2) Start everything:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API

For now, the frontend calls the contact service directly using a gateway-style path:

- `POST /api/v1/contacts`
- `GET /api/v1/contacts`

Later (when your API gateway exists), point the frontend to the gateway by setting `VITE_API_BASE_URL`, and have the gateway route to this service.

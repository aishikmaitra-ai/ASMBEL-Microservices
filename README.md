# Micro — Microservices Demo

A three-service architecture demonstrating microservice routing via an LLM-powered API Gateway. Each service runs independently on its own port; the gateway detects user intent from natural language and opens the correct service in the browser.

---

## Architecture overview

```
User (natural language input)
        │
        ▼
┌─────────────────────────────────┐
│  API Gateway  (:8502)           │
│  frontend.py + gate_llm.py      │
│  Streamlit UI + Groq classifier │
└────────┬────────────┬───────────┘
         │            │
   intent=upload  intent=policy   intent=other → Groq general reply
         │            │
         ▼            ▼
  Python service   JS service
     (:8501)      React :5173 + Node :4001
```

---

## Services

### 1. `python/` — Data Uploader

A Streamlit application for uploading tabular data files and previewing them as a DataFrame.

**Files**

| File | Purpose |
|---|---|
| `frontend_app.py` | Streamlit UI — file uploader, "Start Testing" button, renders DataFrame |
| `model.py` | Business logic — reads CSV, drops columns `A` and `B`, returns cleaned DataFrame |

**Port** `8501`

**How to run**
```bash
cd python
pip install streamlit pandas numpy
streamlit run frontend_app.py
```

**Behaviour**
- Accepts any CSV file via the file uploader widget.
- On clicking "Start Testing", calls `process()` which reads the file and drops columns named `A` or `B` if present.
- Renders the resulting DataFrame in the Streamlit table view.

---

### 2. `JS/` — Policy Creation Service

A React + Node.js service that presents a contact/policy creation form and persists submissions in memory.

**Files**

| File | Purpose |
|---|---|
| `App.jsx` | React form component — fields, validation display, submit/reset logic |
| `api.js` | `createContact()` — posts form payload to `POST /api/v1/contacts` |
| `validators.js` | Client-side validation — required fields, email regex, contact digits (7–15), India-only pincode |
| `index.js` | Express server — CORS, in-memory contacts array, `/health`, `/contacts`, `/api/v1/contacts` |

**Ports**

| Process | Port |
|---|---|
| React (Vite) | `5173` |
| Node (Express) | `4001` |

**How to run**
```bash
cd JS

# Start Node backend
node index.js          # or: PORT=4001 node index.js

# Start React frontend (separate terminal)
npm run dev            # Vite dev server on :5173
```

**API endpoints (Node)**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns service name + timestamp |
| `GET` | `/contacts` | List all contacts (in-memory) |
| `POST` | `/contacts` | Create contact (internal route) |
| `GET` | `/api/v1/contacts` | Same as above — gateway-style public route |
| `POST` | `/api/v1/contacts` | Create contact (public route, used by React) |

**Contact payload schema**

```json
{
  "firstName": "string (required)",
  "lastName":  "string (required)",
  "contact":   "string, 7–15 digits (required)",
  "email":     "valid email (required)",
  "address":   "string (required)",
  "state":     "string (required)",
  "country":   "string (required)",
  "pincode":   "6-digit string (required if country = India)"
}
```

**Validation rules**

| Field | Rule |
|---|---|
| `firstName`, `lastName`, `address`, `state`, `country` | Non-empty string |
| `contact` | Digits only (after stripping non-numeric), length 7–15 |
| `email` | Must match `x@x.x` pattern |
| `pincode` | Required only when `country === "India"`, exactly 6 digits |

**Notes**
- Contacts are stored in a plain in-memory array (`inMemoryContacts`). Data is lost on server restart. No database is connected.
- `CORS_ORIGIN` defaults to `http://localhost:5173`. Override via environment variable if deploying elsewhere.
- The React app reads `VITE_API_BASE_URL` from `.env`. Falls back to `http://localhost:4001`.

---

### 3. `API Gateway/` — LLM Router

A Streamlit application that accepts free-text input, classifies the intent using a Groq LLM, and routes to the appropriate service by opening it in the browser.

**Files**

| File | Purpose |
|---|---|
| `frontend.py` | Streamlit UI — text input area, displays routing reply |
| `gate_llm.py` | Groq client, intent classifier, `route_prompt()`, CLI entry point |

**Port** `8502` (or whichever port Streamlit assigns — run separately from the Python service)

**How to run**
```bash
cd "API Gateway"
pip install streamlit groq python-dotenv
streamlit run frontend.py

# Or run as CLI
python gate_llm.py
```

**Routing logic**

```
User input
    │
    ▼
Groq classifier (llama-3.3-70b-versatile, temp=0.3)
    │
    ├── "upload"  → opens http://localhost:8501  (Data Uploader)
    ├── "policy"  → opens http://localhost:5173  (Policy Creation)
    └── "other"   → calls Groq again as a general assistant and returns the reply
```

The classifier is prompted to return exactly one word (`policy`, `upload`, or `other`). The response is lowercased and matched with a simple `if/elif`. If neither service intent is detected, the gateway falls back to a general conversational Groq response.

**Environment variables**

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | API key from [console.groq.com](https://console.groq.com) |

Create a `.env` file in the `API Gateway/` directory:
```
GROQ_API_KEY=your_key_here
```

---

## Running all three services simultaneously

Open three terminal windows:

```bash
# Terminal 1 — Data Uploader
cd python
streamlit run frontend_app.py --server.port 8501

# Terminal 2 — Node backend
cd JS
node index.js

# Terminal 3 — React frontend
cd JS
npm run dev

# Terminal 4 — API Gateway
cd "API Gateway"
streamlit run frontend.py --server.port 8502
```

Then open the gateway at `http://localhost:8502` and type something like:

- `"I want to upload my sales data"` → opens the Data Uploader
- `"I need to create a new policy"` → opens the Policy Creation form
- `"What is a microservice?"` → returns a Groq chat response inline

---

## Dependencies

### Python services (`python/` and `API Gateway/`)

```
streamlit
pandas
numpy
groq
python-dotenv
```

### JS service (`JS/`)

```
express
cors
react
vite
```

---

## Current limitations

- The Node contact service has no database. All contacts are lost on restart.
- The gateway opens services via `webbrowser.open()` which only works on a machine with a desktop browser. It will not work in headless/server environments.
- The Python Data Uploader currently only supports CSV files. Excel/other formats require extending `model.py`.
- Column dropping in `model.py` is hardcoded to columns `A` and `B`. This should be made configurable.
- No authentication or shared session state between services.
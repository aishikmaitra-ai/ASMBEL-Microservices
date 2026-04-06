import express from "express";
import cors from "cors";
import { proxyJson } from "./proxy.js";

const app = express();

const PORT = Number.parseInt(process.env.PORT ?? "4000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const CONTACT_SERVICE_URL = process.env.CONTACT_SERVICE_URL ?? "http://localhost:4001";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "64kb" }));

app.get("/health", async (_req, res) => {
  res.json({
    service: "api-gateway",
    ok: true,
    time: new Date().toISOString(),
    routes: {
      contacts: "/api/v1/contacts"
    }
  });
});

app.get("/api/v1/contacts", async (req, res) => {
  return proxyJson({
    req,
    res,
    upstreamBaseUrl: CONTACT_SERVICE_URL,
    upstreamPath: "/contacts"
  });
});

app.post("/api/v1/contacts", async (req, res) => {
  return proxyJson({
    req,
    res,
    upstreamBaseUrl: CONTACT_SERVICE_URL,
    upstreamPath: "/contacts"
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`api-gateway listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`proxying contact-service at ${CONTACT_SERVICE_URL}`);
});


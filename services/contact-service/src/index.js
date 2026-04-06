import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { validateContactPayload } from "./validation.js";

const app = express();

const PORT = Number.parseInt(process.env.PORT ?? "4001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "64kb" }));

const inMemoryContacts = [];

app.get("/health", (_req, res) => {
  res.json({
    service: "contact-service",
    ok: true,
    time: new Date().toISOString()
  });
});

function listContacts(_req, res) {
  res.json({ contacts: inMemoryContacts });
}

function createContact(req, res) {
  const { isValid, errors, value } = validateContactPayload(req.body);
  if (!isValid) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid contact payload.",
      fields: errors
    });
  }

  const record = {
    id: randomUUID(),
    ...value,
    createdAt: new Date().toISOString()
  };

  inMemoryContacts.unshift(record);

  return res.status(201).json({
    contact: record
  });
}

// Service-native routes (internal)
app.get("/contacts", listContacts);
app.post("/contacts", createContact);

// Gateway-style routes (public contract; later these can be owned by a real API gateway)
app.get("/api/v1/contacts", listContacts);
app.post("/api/v1/contacts", createContact);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`contact-service listening on http://localhost:${PORT}`);
});

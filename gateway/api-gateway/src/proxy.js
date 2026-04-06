import { randomUUID } from "node:crypto";

export function pickRequestId(req) {
  const existing = req.header("x-request-id");
  if (existing && existing.trim()) return existing.trim();
  return randomUUID();
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}

export async function proxyJson({
  req,
  res,
  upstreamBaseUrl,
  upstreamPath
}) {
  const requestId = pickRequestId(req);
  const url = new URL(upstreamPath, upstreamBaseUrl);

  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("x-request-id", requestId);

  const upstreamResponse = await fetch(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : safeJson(req.body)
  }).catch((error) => {
    const message = error instanceof Error ? error.message : "Upstream error";
    return { ok: false, status: 502, json: async () => ({ error: "BAD_GATEWAY", message }) };
  });

  let payload;
  try {
    payload = await upstreamResponse.json();
  } catch {
    payload = { error: "UPSTREAM_INVALID_JSON", message: "Upstream returned invalid JSON." };
  }

  res.setHeader("x-request-id", requestId);
  return res.status(upstreamResponse.status ?? 502).json(payload);
}

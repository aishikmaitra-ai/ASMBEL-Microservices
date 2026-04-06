const DEFAULT_BASE = "http://localhost:4001";

export function getApiBaseUrl() {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
}

export async function createContact(payload) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/contacts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = json?.message || "Request failed.";
    const fields = json?.fields || {};
    const error = new Error(message);
    error.status = response.status;
    error.fields = fields;
    throw error;
  }

  return json;
}

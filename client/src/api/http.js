/**
 * Small HTTP helper for calling the backend API.
 * - Adds JSON headers
 * - Adds Authorization header if token exists
 * - Parses JSON
 * - Throws a readable error on non-2xx responses
 */

export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token"); // store the token in localStorage so browser keeps it across page reloads and sessions

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { //wait for the response from the fetch call
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON (even for errors)
  const data = await res.json().catch(() => null);

  if (!res.ok) { //status code is not in the 200-299 range
    const message =
      data?.error?.message || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
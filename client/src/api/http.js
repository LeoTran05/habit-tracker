const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = joinUrl(API_BASE_URL, path);
  console.log("apiFetch URL:", url);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Request failed (${res.status})`
    );
  }

  return data;
}
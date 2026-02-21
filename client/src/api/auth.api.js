/**
 *  API functions for authentication (login, register, get current user)
 *
 */


import { apiFetch } from "./http";

export async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(email, password) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export async function me() {
  return apiFetch("/api/auth/me");
}
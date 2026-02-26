/* 
This file contains API functions for interacting with the habits backend.
It provides functions to create, complete, and retrieve habits.
These functions use the Fetch API to send HTTP requests to the server and handle responses.
Each function corresponds to a specific endpoint defined in the server's routes and services.
*/

import { apiFetch } from "./http";

export async function getHabitSummary(asOf) {
  const qs = asOf ? `?asOf=${encodeURIComponent(asOf)}` : "";
  return apiFetch(`/api/habits/summary${qs}`);
}

export async function createHabit(name) {
  return apiFetch("/api/habits", {
    method: "POST",
    body: { name },
  });
}

export async function completeHabit(habitId, date) {
  return apiFetch(`/api/habits/${habitId}/complete`, {
    method: "POST",
    body: date ? { date } : {}, // backend defaults to today
  });
}

export async function uncompleteHabit(habitId, date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch(`/api/habits/${habitId}/complete${qs}`, {
    method: "DELETE",
  });
}

/* 
This file contains API functions for interacting with the habits backend.
It provides functions to create, complete, and retrieve habits.
These functions use the Fetch API to send HTTP requests to the server and handle responses.
Each function corresponds to a specific endpoint defined in the server's routes and services.
*/

import { apiFetch } from "./http";

export async function getHabitSummary(asOf) {
  const qs = asOf ? `?asOf=${encodeURIComponent(asOf)}` : "";
  return apiFetch(`/habits/summary${qs}`);
}

export async function createHabit(name) {
  return apiFetch("/habits", {
    method: "POST",
    body: { name },
  });
}

export async function getArchivedHabits() {
  return apiFetch("/habits/archived");
}

export async function deleteHabit(habitId) {
  return apiFetch(`/habits/${habitId}`, {
    method: "DELETE",
  });
}

export async function completeHabit(habitId, date) {
  // optional date in body
  return apiFetch(`/habits/${habitId}/complete`, {
    method: "POST",
    body: date ? { date } : undefined,
  });
}

export async function uncompleteHabit(habitId, date) {
  // date in query string
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch(`/habits/${habitId}/complete${qs}`, {
    method: "DELETE",
  });
}

export async function updateHabitName(habitId, newName) {
  return apiFetch(`/habits/${habitId}`, {
    method: "PATCH",
    body: { name: newName },
  });
}
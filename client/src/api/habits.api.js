/* 
This file contains API functions for interacting with the habits backend.
It provides functions to create, complete, and retrieve habits.
These functions use the Fetch API to send HTTP requests to the server and handle responses.
Each function corresponds to a specific endpoint defined in the server's routes and services.
*/

import { apiFetch } from "./http";

export async function getHabitSummary() {
  return apiFetch("/api/habits/summary");
}

export async function createHabit(name) {
  return apiFetch("/api/habits", {
    method: "POST",
    body: { name },
  });
}

export async function completeHabit(habitId) {
  return apiFetch(`/api/habits/${habitId}/complete`, {
    method: "POST",
    body: {}, // backend defaults to today
  });
}

export async function uncompleteHabit(habitId) {
  return apiFetch(`/api/habits/${habitId}/complete`, {
    method: "DELETE",
  });
}
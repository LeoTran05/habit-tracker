/***    
 * This file contains the service functions for managing habits in the Habit Tracker application.
 * - Creating a new habit
 * - Retrieving habits for a user
 * - Updating habit details
 * - Deleting a habit
 */

const { rows } = require("pg/lib/defaults");
const { query } = require("../db/pool");

async function createHabit(userId, name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
        const err = new Error("Habit name is required and must be a non-empty string");
        err.status = 400;
        err.code = "VALIDATION_ERROR";
        throw err;
    }

    // Insert the new habit into the database and return the created habit
    const newHabit = await query(
        `
        INSERT INTO habits (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name, frequency, created_at, archived_at
        `,
        [userId, name.trim()]
    );

    return newHabit[0];
} 

async function completeHabit(userId, habitId, date) {
  // 1) Ownership + not archived
  const habits = await query(
    `
    SELECT id
    FROM habits
    WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
    `,
    [habitId, userId]
  );

  if (habits.length === 0) {
    const err = new Error("Habit not found");
    err.status = 404;
    err.code = "HABIT_NOT_FOUND";
    throw err;
  }

  // 2) Resolve date
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let finalDate = today;

  if (date !== undefined && date !== null && String(date).trim() !== "") {
    const d = String(date).trim();

    // format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) {
      const err = new Error("Invalid date format (expected YYYY-MM-DD)");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    if (d > today) {
      const err = new Error("Cannot complete habit for a future date");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    finalDate = d;
  }

  // 3) Insert completion (DB enforces uniqueness)
  try {
    const rows = await query(
      `
      INSERT INTO habit_completions (habit_id, date)
      VALUES ($1, $2)
      RETURNING id, habit_id, date, created_at
      `,
      [habitId, finalDate]
    );

    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      const e = new Error("Habit already completed for this date");
      e.status = 409;
      e.code = "ALREADY_COMPLETED";
      throw e;
    }
    throw err;
  }
}

async function uncompleteHabit(userId, habitId, date) {
    const habits = await query(
    `
    SELECT id
    FROM habits
    WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
    `,
    [habitId, userId]
  );

  if (habits.length === 0) {
    const err = new Error("Habit not found");
    err.status = 404;
    err.code = "HABIT_NOT_FOUND";
    throw err;
  }

  // 2) Resolve date
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let finalDate = today;

  if (date !== undefined && date !== null && String(date).trim() !== "") {
    const d = String(date).trim();

    // format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) {
      const err = new Error("Invalid date format (expected YYYY-MM-DD)");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    if (d > today) {
      const err = new Error("Invalid Date");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    finalDate = d;
  }

  
    const rows = await query(
      `
        DELETE FROM habit_completions
        WHERE habit_id = $1 AND date = $2
        RETURNING id;
      `,
      [habitId, finalDate]
    );

    if (rows.length === 0) {
        const err = new Error("Completion not found for the given date");
        err.status = 404; 
        err.code = "NOT_COMPLETED";
        throw err;
    }

    return { ok: true };

} 

    
  


module.exports = { createHabit, completeHabit, uncompleteHabit };
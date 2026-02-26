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

async function getHabitSummary(userId, asOf) {
  const toISODate = (d) => d.toISOString().slice(0, 10);

  let baseDate;

  if (asOf) {
    // Force UTC-safe interpretation
    const [y, m, d] = asOf.split("-").map(Number);
    baseDate = new Date(Date.UTC(y, m - 1, d));
  } else {
    baseDate = new Date();
  }

  const to = toISODate(baseDate);

  const fromDate = new Date(baseDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  const from = toISODate(fromDate);

  // 1) Get active habits for user
  const habits = await query(
    `
    SELECT id, name, frequency, created_at, archived_at
    FROM habits
    WHERE user_id = $1 AND archived_at IS NULL
    ORDER BY created_at DESC
    `,
    [userId]
  );

  if (habits.length === 0) {
    return { range: { from, to }, habits: [] };
  }

  const habitIds = habits.map((h) => h.id);

  // 2) Get completions in date range for those habits
  // NOTE: c.date is a DATE column. We cast to text to get "YYYY-MM-DD" consistently.
  const completions = await query(
    `
    SELECT habit_id, date::text AS date
    FROM habit_completions
    WHERE habit_id = ANY($1::int[])
      AND date >= $2::date
      AND date <= $3::date
    `,
    [habitIds, from, to]
  );

  // Build lookup: habitId -> Set of completed dates (YYYY-MM-DD)
  const completionMap = new Map();
  for (const row of completions) {
    if (!completionMap.has(row.habit_id)) {
      completionMap.set(row.habit_id, new Set());
    }
    completionMap.get(row.habit_id).add(row.date);
  }

  // Build the 7-day date list (oldest -> newest)
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(toISODate(d));
  }

  // Merge into output
  const summarized = habits.map((h) => {
    const set = completionMap.get(h.id) || new Set();
    const last7 = dates.map((date) => ({ date, done: set.has(date) }));

    return {
      id: h.id,
      name: h.name,
      frequency: h.frequency,
      created_at: h.created_at,
      archived_at: h.archived_at,
      doneToday: set.has(to),
      last7,
    };
  });

  return { range: { from, to }, habits: summarized };
}


async function getHabits(userId) {
    const habits = await query(
        `
        SELECT id, name, frequency, created_at, archived_at
        FROM habits
        WHERE user_id = $1 AND archived_at IS NULL
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return habits;
}

module.exports = { createHabit, completeHabit, uncompleteHabit, getHabits, getHabitSummary };

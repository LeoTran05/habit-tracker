/***    
 * This file contains the service functions for managing habits in the Habit Tracker application.
 * - Creating a new habit
 * - Retrieving habits for a user
 * - Updating habit details
 * - Deleting a habit
 */

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

module.exports = { createHabit };

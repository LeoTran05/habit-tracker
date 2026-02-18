/**
 * Postgres connection pool.
 *
 * Responsibilities:
 * - Establish connection to database using DATABASE_URL
 * - Provide a shared query helper
 * - Fail fast if configuration is invalid
 */

const { Pool } = require("pg");

// Ensure DATABASE_URL exists early
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Lightweight query helper.
 *
 * @param {string} text - SQL query
 * @param {Array<any>} params - parameterized values
 * @returns {Promise<Array>} rows
 */
async function query(text, params) {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Optional: debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("executed query", { text, duration, rows: result.rowCount });
    }

    return result.rows;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
};

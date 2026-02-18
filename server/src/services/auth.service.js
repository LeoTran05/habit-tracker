/**
 * Auth service (business logic).
 * - Validates credentials at a basic level
 * - Hashes passwords
 * - Creates user in DB
 * - Issues JWT
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../db/pool");

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  // Keep payload minimal: only what you need for auth.
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function register(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const pwd = String(password || "");

  // Basic validation (you can strengthen later)
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    const err = new Error("Invalid email");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  if (pwd.length < 8) {
    const err = new Error("Password must be at least 8 characters");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const passwordHash = await bcrypt.hash(pwd, BCRYPT_ROUNDS);

  try {
    const rows = await query(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at
      `,
      [normalizedEmail, passwordHash]
    );

    const user = rows[0];
    const token = signToken(user);

    return { token, user };
  } catch (e) {
    // Handle unique constraint violation on email
    // Postgres unique violation code: 23505
    if (e && e.code === "23505") {
      const err = new Error("Email already in use");
      err.status = 409;
      err.code = "EMAIL_TAKEN";
      throw err;
    }
    throw e;
  }
}

async function login(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const pwd = String(password || "");
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    const err = new Error("Invalid email");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  if (!pwd) {
    const err = new Error("Password is required");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  
  const rows = await query(
    `
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const user = rows[0];
  const isValidPassword = await bcrypt.compare(pwd, user.password_hash);

  if (!isValidPassword) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  const safeUser = {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };

  const token = signToken(safeUser);
  return { token, user: safeUser };
} 

module.exports = { register, login };

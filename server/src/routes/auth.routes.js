/**
 * Auth routes (HTTP layer).
 * - Reads request input
 * - Calls auth service
 * - Returns JSON responses
 */

const express = require("express");
const { register, login } = require("../services/auth.service");
const { apiError } = require("../utils/errors");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await register(email, password);
    return res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "Something went wrong";
    return apiError(res, status, code, message);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {    const { email, password } = req.body || {};
    const result = await login(email, password);
    return res.status(200).json(result);
} catch (err) {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";  
    const message = err.message || "Something went wrong";
    return apiError(res, status, code, message);
  }
});

// /api/auth/me 
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});



// The auth.service.js file would contain the actual logic for registering and logging in users, including database interactions and password hashing. The routes defined here simply call those service functions and handle the HTTP request/response cycle, including error handling.

module.exports = router;

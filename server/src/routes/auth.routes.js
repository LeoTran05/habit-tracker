/**
 * Auth routes (HTTP layer).
 * - Reads request input
 * - Calls auth service
 * - Returns JSON responses
 */

const express = require("express");
const { register } = require("../services/auth.service");
const { apiError } = require("../utils/errors");

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

module.exports = router;

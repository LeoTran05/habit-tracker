/***
 * This file contains the routes for the habits endpoints.
 * It defines the HTTP methods and paths for creating, reading, updating, and deleting habits.
 * Each route handler calls the corresponding service function in habits.service.js and handles the HTTP request/response cycle.
 * The routes are protected with the requireAuth middleware to ensure that only authenticated users can access them.
 */

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createHabit, completeHabit, uncompleteHabit} = require("../services/habits.service");
const { apiError } = require("../utils/errors");
const router = express.Router();

// POST /api/habits - Create a new habit
router.post("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body || {};
        const newHabit = await createHabit(userId, name);
        return res.status(201).json(newHabit);
    } catch (err) {
        const status = err.status || 500;
        const code = err.code || "INTERNAL_ERROR";  
        const message = err.message || "Something went wrong";
        return apiError(res, status, code, message);
    }
});

// POST /api/habits/:id/complete
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = Number(req.params.id);

    if (!Number.isInteger(habitId)) {
      return apiError(res, 400, "VALIDATION_ERROR", "Invalid habit id");
    }

    const { date } = req.body || {};
    const result = await completeHabit(userId, habitId, date);
    return res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "Something went wrong";
    return apiError(res, status, code, message);
  }
});

// DELETE /api/habits/:id/complete?date=YYYY-MM-DD
router.delete("/:id/complete", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = Number(req.params.id);
    const { date } = req.query || {};

    if (!Number.isInteger(habitId)) {
      return apiError(res, 400, "VALIDATION_ERROR", "Invalid habit id");
    }

    const result = await uncompleteHabit(userId, habitId, date);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "Something went wrong";
    return apiError(res, status, code, message);
  }
});

module.exports = router;
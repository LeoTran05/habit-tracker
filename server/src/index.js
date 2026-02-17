/**
 * Entry point for the Habit Tracker backend.
 *
 * Responsibilities:
 * - Load environment configuration
 * - Create and configure Express app
 * - Register global middleware
 * - Start HTTP server
 *
 * This file should contain minimal business logic.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Use environment-defined port or fallback for local development
const PORT = process.env.PORT || 3001;

/**
 * Global Middleware
 *
 * - cors(): enables cross-origin requests (frontend → backend)
 * - express.json(): parses incoming JSON request bodies
 */
app.use(cors());
app.use(express.json());

/**
 * Health Check Endpoint
 *
 * Used for:
 * - Verifying server is running
 * - Deployment platform health checks
 * - Basic monitoring
 *
 * Should not depend on database or external services.
 */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * Start HTTP server
 *
 * In production, PORT will be provided by hosting provider.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

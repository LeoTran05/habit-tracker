/**
 * Express app factory.
 * Keeps HTTP server boot separate from app configuration for testability.
 */

const express = require("express");
const cors = require("cors");
const { apiError } = require("./utils/errors");

function createApp() {
  const app = express();
  const authRoutes = require("./routes/auth.routes");

  app.use(cors());
  app.use(express.json());

  // Health endpoint for local/dev + deployment checks
  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);

  // 404 handler for unknown routes
  app.use((req, res) => {
    return apiError(res, 404, "NOT_FOUND", "Route not found");
  });

  // Global error handler (last middleware)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    return apiError(res, 500, "INTERNAL_ERROR", "Something went wrong");
  });

  return app;
}

module.exports = { createApp };

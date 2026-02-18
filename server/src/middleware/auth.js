/**
 * Authentication Middleware
 *
 * Responsibilities:
 * - Validate JWT from Authorization header
 * - Attach user info to req.user
 * - Handle missing/invalid tokens with 401 responses
 *
 * This middleware can be applied to any route that requires authentication.
 * It expects the JWT to be in the format: "Bearer <token>"
 *
 * The JWT should be signed with the same secret used in auth.service.js and should include the user's ID and email in the payload. 
 */

const jwt = require("jsonwebtoken");
const { apiError } = require("../utils/errors");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const token = authHeader.slice(7); // remove "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach minimal user info
    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return apiError(res, 401, "UNAUTHORIZED", "Invalid or expired token");
  }
}

module.exports = { requireAuth };

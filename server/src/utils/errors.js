/**
 * Standard API error helpers.
 * Keeps error responses consistent across endpoints.
 */

function apiError(res, status, code, message) {
  return res.status(status).json({
    error: { code, message },
  });
}

module.exports = { apiError };

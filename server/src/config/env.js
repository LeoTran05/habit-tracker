/**
 * Centralised environment variable loading/validation.
 * Fails fast on missing configuration to avoid undefined runtime behaviour.
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function loadEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3001),
    // We will require these later when we introduce DB + auth:
    // DATABASE_URL: requireEnv("DATABASE_URL"),
    // JWT_SECRET: requireEnv("JWT_SECRET"),
  };
}

module.exports = { loadEnv, requireEnv };

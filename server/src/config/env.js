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
  const rawPort = (process.env.PORT || "3001").trim();
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT env var: "${process.env.PORT}"`);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: port,
  };
}


module.exports = { loadEnv, requireEnv };

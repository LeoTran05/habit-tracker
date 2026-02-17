/**
 * Server entrypoint.
 * Starts listening on configured port.
 */

require("dotenv").config();

const { loadEnv } = require("./config/env");
const { createApp } = require("./app");

const env = loadEnv();
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

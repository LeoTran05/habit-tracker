/**
 * Server entrypoint.
 * Starts listening on configured port.
 */

require("dotenv").config();

process.on("exit", (code) => console.log("PROCESS EXIT EVENT. code=", code));
process.on("beforeExit", (code) => console.log("BEFORE EXIT EVENT. code=", code));
process.on("uncaughtException", (err) => console.error("UNCAUGHT", err));
process.on("unhandledRejection", (err) => console.error("UNHANDLED REJECTION", err));

const { loadEnv } = require("./config/env");
const { createApp } = require("./app");

const env = loadEnv();
const app = createApp();

app.listen(env.PORT, () => {
  
  console.log(`Server running on port ${env.PORT}`);
});

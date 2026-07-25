import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let server;
let shuttingDown = false;

async function start() {
  await connectDatabase(env.mongoUri);

  server = app.listen(env.port, () => {
    console.log(`Daymark API listening on http://localhost:${env.port}`);
    console.log(`MongoDB connected to ${mongoose.connection.name}`);
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error("Failed to start Daymark API:", error.message);
  process.exit(1);
});

import "dotenv/config";

const required = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const parsePort = (value) => {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  port: parsePort(process.env.PORT || "4000"),
  mongoUri: required("MONGODB_URI"),
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});

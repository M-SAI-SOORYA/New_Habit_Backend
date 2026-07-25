import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { habitRouter } from "./routes/habit.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { ApiError } from "./utils/ApiError.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new ApiError(403, "Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "100kb" }));

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.get("/", (_request, response) => {
  response.json({
    success: true,
    data: {
      name: "Daymark API",
      version: "1.0.0",
      documentation: "/api",
    },
  });
});

app.get("/api", (_request, response) => {
  response.json({
    success: true,
    data: {
      endpoints: {
        health: "GET /api/health",
        habits: "GET|POST /api/habits",
        habit: "GET|PATCH|DELETE /api/habits/:habitId",
        completion: "PUT /api/habits/:habitId/completions/:date",
        analytics: "GET /api/habits/:habitId/analytics",
      },
    },
  });
});

app.use("/api/health", healthRouter);
app.use("/api/habits", habitRouter);
app.use(notFound);
app.use(errorHandler);

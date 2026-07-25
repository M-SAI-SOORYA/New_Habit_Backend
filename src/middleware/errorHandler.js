import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

function normalizeError(error) {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, validationError]) => [field, validationError.message]),
    );
    return new ApiError(400, "Habit validation failed", details);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return new ApiError(400, "Request body contains invalid JSON");
  }

  return new ApiError(500, "Internal server error");
}

export function errorHandler(error, _request, response, _next) {
  const normalized = normalizeError(error);

  if (normalized.statusCode >= 500) {
    console.error(error);
  }

  const body = {
    success: false,
    error: {
      message: normalized.message,
    },
  };

  if (normalized.details !== undefined) {
    body.error.details = normalized.details;
  }

  response.status(normalized.statusCode).json(body);
}

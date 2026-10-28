import { HABIT_CATEGORIES, HEX_COLOR_PATTERN } from "../constants/habit.js";
import { ApiError } from "../utils/ApiError.js";
import { isDateKey, toDateKey } from "../utils/date.js";

const ALLOWED_FIELDS = new Set([
  "name",
  "category",
  "color",
  "frequency",
  "description",
  "checklist",
  "createdAt",
  "completions",
]);

function validateFields(payload, partial) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }

  const unknownFields = Object.keys(payload).filter((field) => !ALLOWED_FIELDS.has(field));
  if (unknownFields.length) {
    throw new ApiError(400, "Request contains unsupported fields", { fields: unknownFields });
  }

  const requiredFields = ["name", "category", "color", "frequency"];
  const missingFields = partial
    ? []
    : requiredFields.filter((field) => payload[field] === undefined);

  if (missingFields.length) {
    throw new ApiError(400, "Required habit fields are missing", { fields: missingFields });
  }

  if (payload.name !== undefined) {
    if (typeof payload.name !== "string" || !payload.name.trim() || payload.name.trim().length > 80) {
      throw new ApiError(400, "name must contain between 1 and 80 characters");
    }
    payload.name = payload.name.trim();
  }

  if (payload.category !== undefined && !HABIT_CATEGORIES.includes(payload.category)) {
    throw new ApiError(400, `category must be one of: ${HABIT_CATEGORIES.join(", ")}`);
  }

  if (payload.color !== undefined && (typeof payload.color !== "string" || !HEX_COLOR_PATTERN.test(payload.color))) {
    throw new ApiError(400, "color must be a six-digit hex value such as #8b5cf6");
  }

  if (payload.frequency !== undefined && (!Number.isInteger(payload.frequency) || payload.frequency < 1 || payload.frequency > 7)) {
    throw new ApiError(400, "frequency must be an integer between 1 and 7");
  }

  if (payload.description !== undefined) {
    if (typeof payload.description !== "string" || payload.description.trim().length > 500) {
      throw new ApiError(400, "description must contain at most 500 characters");
    }
    payload.description = payload.description.trim();
  }

  if (payload.checklist !== undefined) {
    if (!Array.isArray(payload.checklist) || payload.checklist.length > 12) {
      throw new ApiError(400, "checklist must contain at most 12 items");
    }

    payload.checklist = payload.checklist.map((item) => {
      if (typeof item !== "string" || !item.trim() || item.trim().length > 160) {
        throw new ApiError(400, "Each checklist item must contain between 1 and 160 characters");
      }
      return item.trim();
    });
  }

  if (payload.createdAt !== undefined && !isDateKey(payload.createdAt)) {
    throw new ApiError(400, "createdAt must be a valid date in YYYY-MM-DD format");
  }

  if (payload.createdAt && payload.createdAt > toDateKey()) {
    throw new ApiError(400, "createdAt cannot be in the future");
  }

  if (payload.completions !== undefined) {
    if (!payload.completions || typeof payload.completions !== "object" || Array.isArray(payload.completions)) {
      throw new ApiError(400, "completions must be an object keyed by YYYY-MM-DD");
    }

    for (const [key, completed] of Object.entries(payload.completions)) {
      if (!isDateKey(key) || typeof completed !== "boolean") {
        throw new ApiError(400, "Each completion must use a valid YYYY-MM-DD key and boolean value");
      }
    }
  }

  return payload;
}

export function validateCreateHabit(payload) {
  const habit = validateFields({ ...payload }, false);
  habit.createdAt ??= toDateKey();
  habit.completions ??= {};
  habit.description ??= "";
  habit.checklist ??= [];
  return habit;
}

export function validateUpdateHabit(payload) {
  const habit = validateFields({ ...payload }, true);

  if (!Object.keys(habit).length) {
    throw new ApiError(400, "Provide at least one habit field to update");
  }

  return habit;
}

export function validateCompletion(payload) {
  if (!payload || typeof payload.completed !== "boolean") {
    throw new ApiError(400, "completed must be a boolean");
  }

  return { completed: payload.completed };
}

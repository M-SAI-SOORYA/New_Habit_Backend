import * as habitService from "../services/habit.service.js";
import { ApiError } from "../utils/ApiError.js";
import { isDateKey, toDateKey } from "../utils/date.js";
import {
  validateCompletion,
  validateCreateHabit,
  validateUpdateHabit,
} from "../validation/habit.validation.js";

export async function listHabits(_request, response) {
  const habits = await habitService.listHabits();
  response.json({ success: true, data: habits, meta: { count: habits.length } });
}

export async function getHabit(request, response) {
  const habit = await habitService.getHabit(request.params.habitId);
  response.json({ success: true, data: habit });
}

export async function createHabit(request, response) {
  const payload = validateCreateHabit(request.body);
  const habit = await habitService.createHabit(payload);
  response.status(201).json({ success: true, data: habit });
}

export async function updateHabit(request, response) {
  const payload = validateUpdateHabit(request.body);
  const habit = await habitService.updateHabit(request.params.habitId, payload);
  response.json({ success: true, data: habit });
}

export async function deleteHabit(request, response) {
  await habitService.deleteHabit(request.params.habitId);
  response.status(204).send();
}

export async function setCompletion(request, response) {
  const { date } = request.params;

  if (!isDateKey(date)) {
    throw new ApiError(400, "date must be a valid date in YYYY-MM-DD format");
  }

  const { completed } = validateCompletion(request.body);
  const habit = await habitService.setCompletion(request.params.habitId, date, completed);
  response.json({ success: true, data: habit });
}

export async function getAnalytics(request, response) {
  const through = request.query.through || toDateKey();

  if (!isDateKey(through)) {
    throw new ApiError(400, "through must be a valid date in YYYY-MM-DD format");
  }

  if (through > toDateKey()) {
    throw new ApiError(400, "through cannot be in the future");
  }

  const analytics = await habitService.getAnalytics(request.params.habitId, through);
  response.json({ success: true, data: analytics });
}

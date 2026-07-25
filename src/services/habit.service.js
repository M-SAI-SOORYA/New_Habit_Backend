import mongoose from "mongoose";
import { Habit } from "../models/Habit.js";
import { ApiError } from "../utils/ApiError.js";
import { toDateKey } from "../utils/date.js";
import { calculateHabitAnalytics } from "./analytics.service.js";

function assertObjectId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new ApiError(400, "Invalid habit ID");
  }
}

export async function listHabits() {
  return Habit.find().sort({ createdOn: 1 });
}

export async function getHabit(id) {
  assertObjectId(id);
  const habit = await Habit.findById(id);

  if (!habit) throw new ApiError(404, "Habit not found");
  return habit;
}

export async function createHabit(payload) {
  return Habit.create(payload);
}

export async function updateHabit(id, payload) {
  const habit = await getHabit(id);

  if (payload.createdAt && payload.createdAt > toDateKey()) {
    throw new ApiError(400, "createdAt cannot be in the future");
  }

  Object.assign(habit, payload);
  await habit.save();
  return habit;
}

export async function deleteHabit(id) {
  const habit = await getHabit(id);
  await habit.deleteOne();
}

export async function setCompletion(id, date, completed) {
  const habit = await getHabit(id);

  if (date < habit.createdAt) {
    throw new ApiError(400, "Completion date cannot be earlier than the habit start date");
  }

  if (date > toDateKey()) {
    throw new ApiError(400, "Completion date cannot be in the future");
  }

  if (completed) {
    habit.completions.set(date, true);
  } else {
    habit.completions.delete(date);
  }

  await habit.save();
  return habit;
}

export async function getAnalytics(id, through) {
  const habit = await getHabit(id);
  return calculateHabitAnalytics(habit.toObject({ flattenMaps: true }), through);
}

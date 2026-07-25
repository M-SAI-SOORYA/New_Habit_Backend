import { DATE_KEY_PATTERN } from "../constants/habit.js";

const DAY_MS = 86_400_000;

export function isDateKey(value) {
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function fromDateKey(key) {
  return new Date(`${key}T00:00:00.000Z`);
}

export function addDays(key, amount) {
  const date = fromDateKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateKey(date);
}

export function daysBetween(startKey, endKey) {
  return Math.round((fromDateKey(endKey) - fromDateKey(startKey)) / DAY_MS);
}

export function enumerateDateKeys(startKey, endKey) {
  const count = daysBetween(startKey, endKey);
  if (count < 0) return [];

  return Array.from({ length: count + 1 }, (_, index) => addDays(startKey, index));
}

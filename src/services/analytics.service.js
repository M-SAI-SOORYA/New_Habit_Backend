import {
  addDays,
  daysBetween,
  enumerateDateKeys,
  fromDateKey,
  toDateKey,
} from "../utils/date.js";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function completionObject(habit) {
  if (habit.completions instanceof Map) return Object.fromEntries(habit.completions);
  return habit.completions || {};
}

function getStreaks(completions, endKey) {
  const completedKeys = Object.keys(completions)
    .filter((key) => completions[key] && key <= endKey)
    .sort();

  let longest = 0;
  let running = 0;
  let previousKey = null;
  let runStart = null;
  let bestPeriod = null;

  for (const key of completedKeys) {
    if (previousKey && daysBetween(previousKey, key) === 1) {
      running += 1;
    } else {
      running = 1;
      runStart = key;
    }

    if (running > longest) {
      longest = running;
      bestPeriod = { start: runStart, end: key, days: running };
    }

    previousKey = key;
  }

  let current = 0;
  let cursor = endKey;
  if (!completions[cursor]) cursor = addDays(cursor, -1);

  while (completions[cursor]) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, bestPeriod };
}

export function calculateHabitAnalytics(habit, through = toDateKey()) {
  const completions = completionObject(habit);
  const effectiveEnd = through < habit.createdAt ? habit.createdAt : through;
  const trackedDates = enumerateDateKeys(habit.createdAt, effectiveEnd);
  const totalCompletions = trackedDates.filter((key) => completions[key]).length;
  const totalDaysTracked = trackedDates.length;
  const missedDays = Math.max(0, totalDaysTracked - totalCompletions);
  const completionRate = totalDaysTracked
    ? Math.round((totalCompletions / totalDaysTracked) * 100)
    : 0;
  const last30Start = addDays(effectiveEnd, -29);
  const last30Dates = enumerateDateKeys(
    last30Start < habit.createdAt ? habit.createdAt : last30Start,
    effectiveEnd,
  );
  const last30Completions = last30Dates.filter((key) => completions[key]).length;
  const last30CompletionRate = last30Dates.length
    ? Math.round((last30Completions / last30Dates.length) * 100)
    : 0;
  const weekdayMisses = Array(7).fill(0);

  for (const key of trackedDates) {
    if (!completions[key]) {
      weekdayMisses[fromDateKey(key).getUTCDay()] += 1;
    }
  }

  const mostMissedIndex = weekdayMisses.indexOf(Math.max(...weekdayMisses));
  const streak = getStreaks(completions, effectiveEnd);

  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    completionRate,
    totalCompletions,
    missedDays,
    totalDaysTracked,
    consistencyScore: completionRate,
    last30CompletionRate,
    bestStreakPeriod: streak.bestPeriod,
    mostMissedWeekday: trackedDates.length ? WEEKDAYS[mostMissedIndex] : null,
    through: effectiveEnd,
  };
}

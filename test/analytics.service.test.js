import assert from "node:assert/strict";
import test from "node:test";
import { calculateHabitAnalytics } from "../src/services/analytics.service.js";

test("calculates streaks and completion totals", () => {
  const analytics = calculateHabitAnalytics(
    {
      createdAt: "2026-07-01",
      completions: {
        "2026-07-01": true,
        "2026-07-02": true,
        "2026-07-04": true,
        "2026-07-05": true,
        "2026-07-06": true,
      },
    },
    "2026-07-06",
  );

  assert.equal(analytics.currentStreak, 3);
  assert.equal(analytics.longestStreak, 3);
  assert.equal(analytics.totalCompletions, 5);
  assert.equal(analytics.missedDays, 1);
  assert.equal(analytics.totalDaysTracked, 6);
  assert.equal(analytics.completionRate, 83);
  assert.deepEqual(analytics.bestStreakPeriod, {
    start: "2026-07-04",
    end: "2026-07-06",
    days: 3,
  });
});

test("keeps a current streak alive when the latest completion was yesterday", () => {
  const analytics = calculateHabitAnalytics(
    {
      createdAt: "2026-07-20",
      completions: {
        "2026-07-23": true,
        "2026-07-24": true,
      },
    },
    "2026-07-25",
  );

  assert.equal(analytics.currentStreak, 2);
  assert.equal(analytics.longestStreak, 2);
});

test("handles a habit with no completions", () => {
  const analytics = calculateHabitAnalytics(
    { createdAt: "2026-07-25", completions: {} },
    "2026-07-25",
  );

  assert.equal(analytics.currentStreak, 0);
  assert.equal(analytics.longestStreak, 0);
  assert.equal(analytics.completionRate, 0);
  assert.equal(analytics.totalCompletions, 0);
  assert.equal(analytics.missedDays, 1);
});

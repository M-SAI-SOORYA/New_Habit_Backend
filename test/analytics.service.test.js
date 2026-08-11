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

test("uses weekly frequency for normal completion rate and missed days", () => {
  const analytics = calculateHabitAnalytics(
    {
      createdAt: "2026-07-01",
      frequency: 3,
      completions: {
        "2026-07-01": true,
        "2026-07-03": true,
        "2026-07-06": true,
      },
    },
    "2026-07-07",
  );

  assert.equal(analytics.totalCompletions, 3);
  assert.equal(analytics.totalDaysTracked, 7);
  assert.equal(analytics.missedDays, 0);
  assert.equal(analytics.completionRate, 100);
  assert.equal(analytics.last30CompletionRate, 100);
});

test("uses recent target rate for consistency score", () => {
  const analytics = calculateHabitAnalytics(
    {
      createdAt: "2026-06-01",
      frequency: 7,
      completions: {
        "2026-07-01": true,
        "2026-07-02": true,
        "2026-07-03": true,
        "2026-07-04": true,
        "2026-07-05": true,
        "2026-07-06": true,
        "2026-07-07": true,
        "2026-07-08": true,
        "2026-07-09": true,
        "2026-07-10": true,
      },
    },
    "2026-07-10",
  );

  assert.equal(analytics.completionRate, 25);
  assert.equal(analytics.last30CompletionRate, 33);
  assert.equal(analytics.consistencyScore, 33);
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

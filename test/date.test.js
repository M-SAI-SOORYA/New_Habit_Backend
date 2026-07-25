import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  daysBetween,
  enumerateDateKeys,
  isDateKey,
} from "../src/utils/date.js";

test("validates real calendar dates", () => {
  assert.equal(isDateKey("2024-02-29"), true);
  assert.equal(isDateKey("2025-02-29"), false);
  assert.equal(isDateKey("2026-13-01"), false);
  assert.equal(isDateKey("07/25/2026"), false);
});

test("performs date-only arithmetic in UTC", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(daysBetween("2026-07-01", "2026-07-25"), 24);
  assert.deepEqual(enumerateDateKeys("2026-07-23", "2026-07-25"), [
    "2026-07-23",
    "2026-07-24",
    "2026-07-25",
  ]);
});

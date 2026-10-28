import assert from "node:assert/strict";
import test from "node:test";
import { validateCreateHabit, validateUpdateHabit } from "../src/validation/habit.validation.js";

const baseHabit = {
  name: "Read",
  category: "learning",
  color: "#8b5cf6",
  frequency: 5,
};

test("accepts and trims optional habit guidance", () => {
  const habit = validateCreateHabit({
    ...baseHabit,
    description: " Read 20 pages without distractions. ",
    checklist: [" Pick a book ", " Read 20 pages "],
  });

  assert.equal(habit.description, "Read 20 pages without distractions.");
  assert.deepEqual(habit.checklist, ["Pick a book", "Read 20 pages"]);
});

test("allows clearing optional habit guidance", () => {
  const habit = validateUpdateHabit({ description: "", checklist: [] });

  assert.equal(habit.description, "");
  assert.deepEqual(habit.checklist, []);
});

test("rejects blank checklist items", () => {
  assert.throws(
    () => validateCreateHabit({ ...baseHabit, checklist: ["Plan tomorrow", " "] }),
    /Each checklist item/,
  );
});

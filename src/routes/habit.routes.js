import { Router } from "express";
import {
  createHabit,
  deleteHabit,
  getAnalytics,
  getHabit,
  listHabits,
  setCompletion,
  updateHabit,
} from "../controllers/habit.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const habitRouter = Router();

habitRouter
  .route("/")
  .get(asyncHandler(listHabits))
  .post(asyncHandler(createHabit));

habitRouter.get("/:habitId/analytics", asyncHandler(getAnalytics));
habitRouter.put("/:habitId/completions/:date", asyncHandler(setCompletion));

habitRouter
  .route("/:habitId")
  .get(asyncHandler(getHabit))
  .patch(asyncHandler(updateHabit))
  .delete(asyncHandler(deleteHabit));

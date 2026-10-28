import mongoose from "mongoose";
import { HABIT_CATEGORIES, HEX_COLOR_PATTERN } from "../constants/habit.js";
import { isDateKey, toDateKey } from "../utils/date.js";

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },
    category: {
      type: String,
      required: true,
      enum: HABIT_CATEGORIES,
    },
    color: {
      type: String,
      required: true,
      match: HEX_COLOR_PATTERN,
    },
    frequency: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      validate: Number.isInteger,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    checklist: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 160,
        },
      ],
      default: [],
      validate: {
        validator: (items) => items.length <= 12,
        message: "checklist cannot contain more than 12 items",
      },
    },
    createdAt: {
      type: String,
      required: true,
      default: toDateKey,
      validate: {
        validator: isDateKey,
        message: "createdAt must be a valid date in YYYY-MM-DD format",
      },
    },
    completions: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
  },
  {
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "updatedOn",
    },
    versionKey: false,
    toJSON: {
      flattenMaps: true,
      transform: (_document, returned) => {
        returned.id = returned._id.toString();
        delete returned._id;
        return returned;
      },
    },
  },
);

habitSchema.index({ createdOn: 1 });

export const Habit = mongoose.model("Habit", habitSchema);

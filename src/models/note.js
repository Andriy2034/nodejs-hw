import { Schema, model } from "mongoose";
import TAGS from "../constants/tags.js";


const noteSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    default: "",
  },
  tag: {
    type: String,
    enum: TAGS,
    default: "Todo"
  },

}, { timestamps: true });


noteSchema.index ({
  tag: 1,
  title: 1,
  content: 1
});

export const Note = model("Note", noteSchema);

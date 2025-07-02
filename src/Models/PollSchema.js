import mongoose from "mongoose";

const PollSchema = mongoose.Schema({
  question: String,
  options: [
    {
      optionText: String,
      votes: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
  ],
});

const Poll = mongoose.model("poll", PollSchema);
export { Poll };

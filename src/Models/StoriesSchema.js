import mongoose from "mongoose";

const storySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: {
    type: [Object], // Use an array to store multiple image URLs
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  albumPeriority: {
    type: [Boolean],
    required: true,
  }, periority: {
    type: Boolean,

    enum: [true, false],
  },
});

const Story = mongoose.model("Story", storySchema);
export { Story };

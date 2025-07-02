import mongoose from "mongoose";

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Use an array to store multiple image URLs
      required: false,
    },
    link: {
      type: String, // Use an array to store multiple image URLs
      required: false,
    },
    reportedBy: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("video", videoSchema);
export { Video };

import mongoose from "mongoose";

const CommentSchema = mongoose.Schema(
  {
    postId: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    message: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("comment", CommentSchema);
export { Comment };

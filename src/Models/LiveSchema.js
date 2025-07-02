import mongoose from "mongoose";

const LiveSchema = mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
});

const Live = mongoose.model("live", LiveSchema);
export default Live;

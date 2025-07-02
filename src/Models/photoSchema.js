import mongoose from "mongoose";

const photoSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: {
    type: [Object],
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  url: {
    type: String,
    default: "",
  },
  albumPeriority: {
    type: [Boolean],
    required: true,
  },
  periority: {
    type: Boolean,
    required: true,

    enum: [true, false],
  },
});

const Photo = mongoose.model("photo", photoSchema);
export { Photo };

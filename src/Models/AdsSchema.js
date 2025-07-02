import mongoose from "mongoose";

const AdsSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    imgLink: {
      type: String,
      required: true,
    },
    noAds: {
      type: Number,
      default: 0,
    },
    noOfImpression: {
      type: Number,
      default: 0,
    },
    link: {
      type: String,
    },
    slugName: {
      type: String,
      required: true,
    },
    StartAt: {
      type: String,
      required: true,
    },
    EndAt: {
      type: String,
      required: true,
    },
    Price: {
      type: String,
      required: false,
      default: 0,
    },
    side: {
      type: String,
      // required:true
      enum: ["top", "mid", "bottom","popup"],
    },
    device: {
      type: String,
      // required:true
      enum: ["mobile", "laptop","both"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

const AdsS = mongoose.model("Ad", AdsSchema);
export { AdsS };

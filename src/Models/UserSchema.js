import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    registerd: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["staff", "admin", "journalist", "author"],
    },
    acsses: {
      type: Array,
      // enum:["1","2","3","4","5","6","7"]
    },
    selectedKeywords: {
      type: Array,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);
const otpVerificationSchema = mongoose.Schema(
  {
    UserId: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now() + 3600000 * +1,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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

const User = mongoose.model("User", UserSchema);
const OTP = mongoose.model("otp", otpVerificationSchema);
const Subscription = mongoose.model("subscription", SubscriptionSchema);
export { OTP, User, Subscription };

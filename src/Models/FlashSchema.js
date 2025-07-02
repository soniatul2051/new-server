import mongoose from "mongoose";

const FlashSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        _id: { type: String, required: true },
        link: {
            type: String,
            required: false,
        },
        slugName: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const flashnews = mongoose.model("flashnews", FlashSchema);
export { flashnews };

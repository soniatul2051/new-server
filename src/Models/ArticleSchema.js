import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const ArticleSchema = mongoose.Schema(
  {
    UserID: {
      type: String,
      required: true,
    },
    _id: {
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
    topic: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    keyWord: {
      type: Array,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Urdu"],
      required: true,
    },
    reportedBy: {
      type: String,
      required: true,
    },
    publishBy: {
      type: String,
      required: true,
    },
    newsType: {
      type: String,
      required: true,
      enum: ["breakingNews", "topStories", "all", "upload"],
    },
    type: {
      type: String,
      enum: ["img", "vid"],
      default: "img",
    },
    subCategory: {
      type: String,
    },
    comment: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: String,
      default: "online",
    },
    slug: {
      type: String,
    },
    priority: {
      type: Boolean,
      default: false,
      required: true,
    },
    slider: {
      type: Boolean,
      default: false,
      required: true,
    },
    // Slider Schedule Add these new fields
    publishAt: { 
      type: Date, 
      default: Date.now 
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'online', 'offline', 'published'],
      default: 'draft'
    },
    lastPublishedAt:{
      type: Date,
      default: Date.now
    } ,

    sequence: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (v >= 1 && v <= 2);
        },
        message: 'Sequence must be either 1 or 2'
      }
    },

  },
  {
    timestamps: true,
  }
);

const ReportSchema = mongoose.Schema({
  adminId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  articleId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
});

const ContentSchema = mongoose.Schema({
  adminId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["tag", "category"],
  },
  text: {
    type: String,
    required: true,
    unique: function () {
      return this.type === "tag"; // Only enforce uniqueness for tags
    },
    sparse: true, // Allows the text to be non-unique for categories or other types
  },
  sequence: {
    type: Number,
    required: function () {
      return this.type === "category"; // Only required for 'category'
    },
    unique: function () {
      return this.type === "category"; // Unique only for 'category'
    },
    sparse: true, // Allows null for tags
  },
});
const subCategory = mongoose.Schema({
  adminId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const Article = mongoose.model("Article", ArticleSchema);
const Report = mongoose.model("Report", ReportSchema);
const Content = mongoose.model("Content", ContentSchema);
const SubCategory = mongoose.model("subCategory", subCategory);
export { Article, Report, Content, SubCategory };
